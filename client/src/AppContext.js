import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Get the initial cart items from local storage
    const localData = localStorage.getItem('cartItems');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    // Save cart items to local storage when they change
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const onAddToCart = (product, quantityToAdd = 1) => {
    setCartItems((prevItems) => {
      // Find the product in the cart
      const itemIndex = prevItems.findIndex((item) => item.id === product.id);
  
      if (itemIndex > -1) {
        // Product is already in the cart, so make a new array with the updated quantity
        return prevItems.map((item, index) => {
          if (index === itemIndex) {
            return { ...item, quantity: item.quantity + quantityToAdd };
          }
          return item;
        });
      } else {
        // Product is not in the cart, so add it with the specified quantity
        return [...prevItems, { ...product, quantity: quantityToAdd }];
      }
    });
  };  

  const onRemoveFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };  

  const onUpdateQuantity = (productId, quantity) => {
    setCartItems((prevItems) => prevItems.map((item) => {
      if (item.id === productId) {
        return { ...item, quantity: quantity };
      }
      return item;
    }));
  };

  const onCheckout = () => {
    // Perform the checkout operations here...
    // After successful checkout, reset the cart
    setCartItems([]);
    // Also clear the local storage
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, onAddToCart, onRemoveFromCart, onUpdateQuantity, onCheckout }}>
      {children}
    </CartContext.Provider>
  );
};
