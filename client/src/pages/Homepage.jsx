import React, { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "../AuthTokenContext";
import ProductList from '../components/ProductList';
import ReviewCard from '../components/ReviewCard';
import '../style/Homepage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth0();
  const { user } = useUser();
  const [allProducts, setProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  const { accessToken } = useAuthToken();
  const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    // Fetch the latest products from API
    fetch(`${apiUrl}/products/latest`)
      .then(response => response.json())
      .then(data => setLatestProducts(data))
      .catch(error => {
        console.error('Error fetching latest products:', error);
      });

    // Fetch all products from API
    fetch(`${apiUrl}/products`)
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => {
        // Handle error
        console.error('Error fetching products:', error);
      });
  }, []);

  // Fetch the user's reviews if they are authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const fetchUserReviews = async () => {
        try {
          const response = await fetch(`${apiUrl}/reviews/user`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reviews = await response.json();
          setReviews(reviews);
        } catch (error) {
          console.error("Error fetching the user's reviews:", error);
        }
      };

      fetchUserReviews();
    }
  }, [isAuthenticated, accessToken]);

  const handleUpdateReview = (updatedReview) => {
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review.id === updatedReview.id ? updatedReview : review
      )
    );
  };

  const handleRemoveReview = (reviewId) => {
    setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          {user && (
            <h2 className="welcome-back-heading">👋 Welcome back, {user.name} ! We've missed you!</h2>
          )}
          <div>
            <h3 className="recent-reviews-heading">Your Reviews</h3>
            {reviews.length > 0 ? (
              <div className="reviews-container">
                {reviews.map(review => (
                  <ReviewCard 
                  key={review.id} 
                  review={review} 
                  onUpdateReview={handleUpdateReview} 
                  onRemoveReview={handleRemoveReview}
                  />
                ))}
              </div>
          ) : (
            <p className="no-reviews-message">You haven't written any reviews yet. Your insights are valuable – share your experiences with our community!</p>
          )}
          </div>
        </div>
      ) : (
        <div>
          <h1 className="heading-title">New Arrivals</h1>
          <p className="heading-subtitle">Launch Into Style</p>
          <ProductList products={latestProducts} title="Latest Products" />
        </div>
      )}
      
    <h1 className="heading-title">All Products</h1>
    <p className="heading-subtitle">Everything You Desire</p>
    <ProductList products={allProducts} title="All Products" />
    </div>
  );
};

export default HomePage;
