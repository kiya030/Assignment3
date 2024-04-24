import React, {useState} from 'react';
import '../style/ReviewCard.css';
import { renderStars } from '../utils';
import { useAuthToken } from "../AuthTokenContext";

const DetailReviewCard = ({ review }) => {

  return (
    <div className="detail-review-card">
      <div className="review-header">
        <h3 className="review-user-name">{review.user.name}</h3>
        <div className="review-rating">{renderStars(review.rating)}</div>
      </div>
      <p className="review-content">{review.content}</p>
      <div className="review-footer">
        <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default DetailReviewCard;
