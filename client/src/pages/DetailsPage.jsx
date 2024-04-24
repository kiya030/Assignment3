import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../style/ProductDetail.css';
import DetailReviewCard from '../components/DetailReviewCard';
import { useCart } from '../AppContext';
import { useAuthToken } from "../AuthTokenContext";
import { useAuth0 } from "@auth0/auth0-react";
import { renderStars } from '../utils';

const ProductDetail = () => {
  const { productId } = useParams(); // Get the productId from URL params
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(0); // State for the star rating
  const [quantity, setQuantity] = useState(1);
  const { onAddToCart } = useCart(); // Hook to access cart functionality
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [reviewPosted, setReviewPosted] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const { accessToken } = useAuthToken();

  // Function to increment the quantity
  const incrementQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  // Function to decrement the quantity
  const decrementQuantity = () => {
    setQuantity(prevQuantity => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setShowAddedModal(true);
    setTimeout(() => {
      setShowAddedModal(false); // Automatically close the modal after 3 seconds
    }, 1500);
  };
  
  const handleReviewSubmit = async (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page
    if (!isAuthenticated) {
      // If the user is not logged in, redirect to the login page
      navigate('/login');
    } else {
      try {
        // POST the review to the database
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            rating,
            content: reviewContent,
            productId: parseInt(productId, 10),
          }),
        });

        if (response.ok) {
          // Handle successful review submission
          setReviewContent(''); // Clear the input
          setShowSubmitModal(true);
          setTimeout(() => {
            setShowSubmitModal(false);
          }, 1500);
          
          // After posting the review successfully:
          setReviewPosted(true); // Indicate that a review has been posted
        } else {
          // Handle errors
          console.error('Failed to submit review');
        }
      } catch (error) {
        console.error('Error submitting review:', error);
      }
    }
  };

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    fetch(`${apiUrl}/products/${productId}`) 
      .then(response => response.json())
      .then(data => setProduct(data))
      .catch(error => console.error('Error fetching product details:', error));

  }, [productId]); // Render only once 

  useEffect(() => {
    // Fetch reviews for this product when reviewPosted changes
    
      const apiUrl = process.env.REACT_APP_API_URL;
      fetch(`${apiUrl}/reviews/product/${productId}`)
        .then(response => response.json())
        .then(data => {
          setReviews(data);
          setReviewPosted(false); // Reset the reviewPosted flag after fetching
        })
        .catch(error => console.error('Error fetching product reviews:', error));
    
  }, [productId, reviewPosted]); // Runs whenever reviewPosted changes

  if (!product) {
    return <div>Loading...</div>; // Or some loading indicator
  }

  return (
    <div className="product-detail-page">
      {showAddedModal && (
        <div className="success-modal">
          Added to Cart 🛒 !
        </div>
      )}
      {showSubmitModal && (
        <div className="submit-modal">
          Review Submitted ✉️ !
        </div>
      )}
      <div className="product-detail">
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p className="product-price">${product.price}</p>
        <div className="detail-quantity-adjuster">
          <button className="detail-quantity-change" onClick={decrementQuantity} disabled={quantity <= 1}>
            -
          </button>
          <input type="number" className="detail-quantity-input" value={quantity} readOnly />
          <button className="detail-quantity-change" onClick={incrementQuantity}>
            +
          </button>
        </div>
        <button className="detail-add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
        </button>
      </div>
      <div className="product-reviews">
        <h3>Product Reviews</h3>
        {reviews.length > 0 ? (
          reviews.map(review => <DetailReviewCard key={review.id} review={review} />)
        ) : (
          <p>No reviews for this product yet.</p>
        )}
        <form className='review-form' onSubmit={handleReviewSubmit}>
          <div>{renderStars(rating, setRating)}</div>
          <textarea
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            placeholder="Leave your review here..."
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ProductDetail;
