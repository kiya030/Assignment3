import React, { useState, useEffect } from 'react';
import '../style/Modal.css'

export const Modal = ({ show, onClose, review, onSave, onDelete, renderStars }) => {
    const [newRating, setNewRating] = useState(review.rating);
    const [newContent, setNewContent] = useState(review.content);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
      setNewRating(review.rating);
      setNewContent(review.content);
    }, [review]);    

    const handleClose = () => {
      setIsEditing(false); // Reset editing state
      onClose(); // Call the passed onClose function
    };
  
    if (!show) {
      return null;
    }
  
    return (
      <div className="modal-backdrop" onClick={handleClose}> {/* This will allow clicking outside the modal to close it */}
        <div className="modal-prototype-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close-button" onClick={handleClose}>X</button>
          <h3>{review.product.name}</h3>
          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
          <div>{renderStars(newRating, setNewRating)}</div>
          {isEditing ? (
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
          ) : (
            <p>{newContent || 'No description'}</p> // Fallback text if content is null
          )}
          <div className="modal-footer">
            {isEditing ? (
              <button onClick={() => {
                onSave(review.id, newRating, newContent);
                setIsEditing(false); // Stop editing after save
              }}>Save</button>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)}>Edit</button>
                <button onClick={() => onDelete(review.id)}>Delete</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };
  