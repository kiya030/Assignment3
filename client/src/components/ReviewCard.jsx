import React, {useState} from 'react';
import '../style/ReviewCard.css';
import { renderStars } from '../utils';
import { Modal } from './Modal';
import { useAuthToken } from "../AuthTokenContext";

const ReviewCard = ({ review, onUpdateReview, onRemoveReview }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { accessToken } = useAuthToken();
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSave = async (reviewId, newRating, newContent) => {
    try {
      const response = await fetch(`${apiUrl}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          rating: newRating,
          content: newContent,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const updatedReview = await response.json();
      onUpdateReview(updatedReview);

    } catch (error) {
      console.error("Error updating the user's review:", error);
    }
    handleCloseModal();
  };

  const handleDelete = async (reviewId) => {
    try {
      const response = await fetch(`${apiUrl}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onRemoveReview(reviewId); // Call a method passed down from the parent component to remove the review from the state

    } catch (error) {
      console.error("Error deleting the user's review:", error);
    }

    handleCloseModal(); // Close the modal after delete
  };

  return (
    <div className="review-card" onClick={handleOpenModal}>
      <div className="review-header">
        <h3 className="review-product-name">{review.product.name}</h3>
        <div className="review-rating">{renderStars(review.rating)}</div>
      </div>
      <p className="review-content">{review.content}</p>
      <div className="review-footer">
        <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      <Modal
        show={showModal}
        onClose={handleCloseModal}
        review={review}
        onSave={handleSave}
        onDelete={handleDelete} // Pass the delete handler to the Modal
        renderStars={renderStars}
      />
    </div>
  );
};

export default ReviewCard;
