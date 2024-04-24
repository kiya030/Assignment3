import React, { useState } from 'react';
import '../style/Cart.css';
import { useCart } from '../AppContext';
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "../AuthTokenContext";
import { useLoginRedirect } from '../useLoginRedirect';

const Cart = () => {
  const { cartItems, onRemoveFromCart, onUpdateQuantity, onCheckout } = useCart();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { handleLogin } = useLoginRedirect();
  const apiUrl = process.env.REACT_APP_API_URL;
  const { isAuthenticated } = useAuth0();
  const { accessToken } = useAuthToken();

  // Calculate the subtotal for the cart
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Function to handle the change in quantity from the select dropdown
  const handleChangeQuantity = (item, newQuantity) => {
    onUpdateQuantity(item.id, newQuantity);
  };

  const handleCheckout = () => {
    setShowConfirmModal(true);  // Show the confirmation modal
  };

  const handleConfirmCheckout = async () => {
    setShowConfirmModal(false);

    if (!isAuthenticated) {
      handleLogin();
    } else {
        const orderData = {
            total: subtotal,
            products: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))
        };
    
        // Send a POST request to your server endpoint to create an order
        try {
            const response = await fetch(`${apiUrl}/orders/`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(orderData)
            });
    
            if (response.ok) {
                // Clear the cart and show a success message
                onCheckout();  // Assuming onCheckout clears the cart
                setShowSuccess(true); // Show success message
        
                // Optionally, hide the success message after a few seconds
                setTimeout(() => {
                  setShowSuccess(false);
                }, 3000);
            } else {
                const errorMsg = await response.text();
                console.error('Checkout failed:', errorMsg);
            }
        } catch (error) {
              console.error('Checkout failed:', error);
        }
      }
    };
  

  const handleCancelCheckout = () => {
    setShowConfirmModal(false); // Close the modal without doing anything
  };

  return (
    <div className="cart-container">
      <h2>Your Shopping Cart</h2>
      {cartItems.length === 0 && <div className="cart-empty">Your cart is empty.</div>}
      {cartItems.map((item) => (
        <div key={item.id} className="cart-item">
          <div className="item-info">
            <h4 className="item-title">{item.name}</h4>
              <p className="item-price">${item.price.toFixed(2)}</p>
          </div>
          <div className="cart-quantity-adjuster">
          <button className="cart-quantity-change" disabled={item.quantity <= 1} onClick={() => handleChangeQuantity(item, item.quantity - 1)}>-</button>
            <input type="number" className="cart-quantity-input" value={item.quantity} readOnly />
            <button className="cart-quantity-change" onClick={() => handleChangeQuantity(item, item.quantity + 1)}>+</button>
          </div>
          <button className="remove-btn" onClick={() => onRemoveFromCart(item.id)}>
            remove
          </button>
        </div>
      ))}
      {cartItems.length > 0 && (
        <>
          <div className="cart-subtotal">
            <span>Subtotal: </span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>
            Checkout
          </button>
        </>
      )}
      {showConfirmModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to check out?</p>
            <button onClick={handleConfirmCheckout}>Yes</button>
            <button onClick={handleCancelCheckout}>No</button>
          </div>
        </div>
      )}
      {showSuccess && <div className="modal-success">Checkout Successful!</div>}
    </div>
  );
};

export default Cart;
