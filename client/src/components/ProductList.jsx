import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../AppContext';
import '../style/ProductList.css';

const ProductList = ({ products }) => {
  const navigate = useNavigate(); // Hook to control navigation
  const { onAddToCart } = useCart(); // Hook to access cart functionality
  const [showModal, setShowModal] = useState(false);

  const handleViewProduct = (id) => {
    navigate(`/details/${id}`);
  };

  const handleAddToCart = (product) => {
    onAddToCart(product);
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false); // Automatically close the modal after 3 seconds
    }, 1500);
  };

  return (
    <div className="products-container">
      {showModal && (
      <div className="success-modal">
        Added to Cart 🛒!
      </div>
      )}
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <div className="product-details">
            <h3 className="product-title">{product.name}</h3>
            <p className="product-price">${product.price}</p>
            <div className="button-container">
            <button className="product-btn view-product-btn" onClick={() => handleViewProduct(product.id)}>
              View Details
            </button>
            <button className="product-btn list-add-to-cart-btn" onClick={() => handleAddToCart(product)}>
              Add to Cart
            </button>
          </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
