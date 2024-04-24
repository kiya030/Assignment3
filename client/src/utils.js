import React from 'react';

export const renderStars = (rating, onClick = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`} onClick={() => onClick && onClick(i)}>
          ★
        </span>
      );
    }
    return stars;
};
