import express from "express";
import { PrismaClient } from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

// this is a middleware that will validate the access token sent by the client
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const prisma = new PrismaClient();

// GET: extra endpoint added to a service for the sole purpose of expressing its availability
app.get("/ping", (req, res) => {
    res.send("pong");
});

// Endpoint to get a list of all products
app.get("/products", async (req, res) => {
    try {
      const products = await prisma.product.findMany({
      });
      
      // If no products are found, return a message indicating that
      if(products.length === 0) {
        return res.status(404).json({ message: "No products found." });
      }
  
      // Send back the array of products
      res.json(products);
    } catch (error) {
      // Handle or log the error
      res.status(500).json({ error: error.message });
    }
});

app.get('/products/latest', async (req, res) => {
    try {
      const latestProducts = await prisma.product.findMany({
        take: 6, // Adjust the number as needed to limit the results
        orderBy: {
          createdAt: 'desc',
        },
      });
      res.json(latestProducts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});  

// Endpoint to get a single product by id
app.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!id || typeof id !== 'number' || !Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid id' });
  }

  const product = await prisma.product.findUnique({
    where: {
        id: id,
    },
  });

  // Check if there is any product
  if (!product) {
    return res.status(404).json({ message: 'Product with provided ID does not exist.' });
  }

  res.json(product);
});

// Endpoint to create a new review
app.post("/reviews", requireAuth, async (req, res) => {
  const { rating, content, productId } = req.body;
  const auth0Id = req.auth.payload.sub; // Extract the user's Auth0 ID from the authentication payload

  // Validation (optional): Validate the input data (rating, content, productId)
  if (
    typeof rating !== 'number' ||
    typeof content !== 'string' ||
    !Number.isInteger(productId)
  ) {
    return res.status(400).json({ error: "Invalid data provided for review." });
  }

  try {
    // Create a new review in the database
    const newReview = await prisma.review.create({
      data: {
        rating, // Assuming rating is a number
        content, // Assuming content is a string
        user: {
          connect: { auth0Id } // Connect the review to the user based on Auth0 ID
        },
        product: {
          connect: { id: productId } // Connect the review to the product
        }
      },
    });

    // Respond with the newly created review
    res.status(201).json(newReview);
  } catch (error) {
    console.error("Failed to create review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Endpoint to update a specific review made by an authenticated user
app.put("/reviews/:reviewId", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const auth0Id = req.auth.payload.sub;
  const { content, rating } = req.body;

  try {
    // Find the review by ID and ensure it belongs to the user
    const review = await prisma.review.findUnique({
      where: {
        id: parseInt(reviewId),
      },
      include: {
        user: true, // Include user to check ownership
      },
    });
    if (!review) {
      return res.status(404).json({ error: "Review not found." });
    }

    // Check if the review belongs to the authenticated user
    if (review.user.auth0Id !== auth0Id) {
      return res.status(403).json({ error: "You can only update your own reviews." });
    }

    // Update the review with new data
    const updatedReview = await prisma.review.update({
      where: {
        id: parseInt(reviewId),
      },
      data: {
        content: content || review.content,  // Keep existing content if not provided
        rating: rating || review.rating // Keep existing rating if not provided
      },
      include: {
        user: true,
        product: true, // Include this to return the product data in the response
      },
    });

    res.json(updatedReview);
  } catch (error) {
    console.error("Failed to update review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to delete a specific review made by an authenticated user
app.delete("/reviews/:reviewId", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const auth0Id = req.auth.payload.sub;

  try {
    // Find the review by ID to ensure it exists and belongs to the user
    const review = await prisma.review.findUnique({
      where: {
        id: parseInt(reviewId),
      },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found." });
    }

    // Delete the review
    await prisma.review.delete({
      where: {
        id: parseInt(reviewId),
      },
    });

    // Send a response indicating that the review was successfully deleted
    res.json({ message: "Review successfully deleted." });
  } catch (error) {
    console.error("Failed to delete review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Endpoint to get all reviews from a specific user
app.get('/reviews/user', requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  try {
    // First, find the user in your database by their auth0Id
    const user = await prisma.user.findUnique({
      where: {
        auth0Id: auth0Id
      }
    });

    // If the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch the reviews written by the user, using the user's ID from your database
    const reviews = await prisma.review.findMany({
      where: {
        userId: user.id,  // Use the internal user ID from your database
      },
      include: {
        user: true,  // Include details of the user
        product: true // Include details of the product
      }
    });

    // Return the found reviews
    res.status(200).json(reviews);

  } catch (error) {
    console.error("Error fetching reviews by user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get all reviews for a specific product
app.get('/reviews/product/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
      const reviews = await prisma.review.findMany({
          where: {
              productId: parseInt(productId),
          },
          include: {
              user: true,  // Include details of the user
              product: true // Include details of the product
          }
      });

      res.status(200).json(reviews);
  } catch (error) {
      console.error("Error fetching reviews for product:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to create a new order
app.post('/orders', requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { total, products } = req.body;

  if (!total || !products || products.length === 0) {
    res.status(400).send("Total and products are required.");
    return;
  }

  try {
    // First find the user by auth0Id
    const user = await prisma.user.findUnique({
      where: { auth0Id }
    });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id, // connect the order to the user's id
        total: total,
        products: {
          create: products.map(p => ({
            productId: p.productId, // assuming you are passing productId in products array
            quantity: p.quantity
          }))
        }
      },
      include: {
        products: {
          include: {
            product: true // include product details in the response
          }
        },
        user: true // Optionally include user details in the response
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send(error.message);
  }
});

// Endpoint to get all orders from a specific user
app.get('/orders/user', requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  try {
    // First, find the user in your database by their auth0Id
    const user = await prisma.user.findUnique({
      where: {
        auth0Id: auth0Id
      }
    });

    // If the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch the orders made by the user, using the user's ID from your database
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,  // Use the internal user ID from your database
      },
      include: {
        products: {
          include: {
            product: true, 
          }
        }
      }
    });

    // Return the found orders
    res.status(200).json(orders);

  } catch (error) {
    console.error("Error fetching orders by user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// this endpoint is used by the client to verify the user status and to make sure the user is registered in our database once they signup with Auth0
// if not registered in our database we will create it.
// if the user is already registered we will return the user information
app.post("/verify-user", requireAuth, async (req, res) => {

  const auth0Id = req.auth.payload.sub;
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
  const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];
  console.log(auth0Id, email, name)

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  if (user) {
    res.json(user);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        auth0Id,
        name,
      },
    });

    res.json(newUser);
  }
});

// get Profile information of authenticated user
app.get("/me", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  res.json(user);
});

// update information of authenticated user
app.put("/user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { name, phone, address } = req.body;

  if (!name && !phone && !address) {
    return res.status(400).json({ error: "No data provided for update." });
  }

  try {
    // Find the user by auth0Id to ensure they exist
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update the user with new data
    const updatedUser = await prisma.user.update({
      where: {
        auth0Id,
      },
      data: {
        name: name || user.name,  // Keep existing name if not provided
        phone: phone || user.phone, // Keep existing phone if not provided
        address: address || user.address
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.listen(8000, () => {
    console.log("Server running on http://localhost:8000 🎉 🚀");
});