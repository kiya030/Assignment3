import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from '../UserContext';
import { useAuthToken } from "../AuthTokenContext";
import '../style/ProfilePage.css';


export default function Profile() {
  const { user, updateUser } = useUser();
  const [orders, setOrders] = useState([]);
  const { accessToken } = useAuthToken();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '', 
    address: user?.address || ''
  });
  const [editMode, setEditMode] = useState({
    name: false,
    phone: false, 
    address: false
  });

  const handleChange = (event) => {
    setEditForm({
      ...editForm,
      [event.target.name]: event.target.value
    });
  };

  const handleEdit = (field) => {
    setEditMode({
      ...editMode,
      [field]: true
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateUser(editForm);
    setEditMode({
      name: false,
      phone: false,
      address: false
    });
  };

  useEffect(() => {
    if (user) {
      setEditForm(user);
    }

    const fetchOrders = async () => {
      const response = await fetch(`${apiUrl}/orders/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Failed to fetch orders');
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, accessToken]);


  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      <div className="profile-details">
        {/* Email is displayed, but not in a form since it's not editable */}
        <div className="profile-field">
          <label>📧 Email:</label>
          <span>{user?.email}</span>
        </div>

        {/* Start of the form for editable fields */}
        <form onSubmit={handleSubmit}>
          <div className="profile-field">
            <label>👤 Name:</label>
            {editMode.name ? (
              <input type="text" name="name" value={editForm.name} onChange={handleChange} />
            ) : (
              <span>{editForm.name}</span>
            )}
            <button type="button" className="edit-button" onClick={() => handleEdit('name')}>Edit</button>
          </div>
          <div className="profile-field">
            <label>📞 Phone:</label>
            {editMode.phone ? (
              <input type="tel" name="phone" value={editForm.phone} onChange={handleChange} />
            ) : (
              <span>{editForm.phone}</span>
            )}
            <button type="button" className="edit-button" onClick={() => handleEdit('phone')}>Edit</button>
          </div>
          <div className="profile-field">
            <label>🏠 Address:</label>
            {editMode.address ? (
              <input name="address" value={editForm.address} onChange={handleChange} />
            ) : (
              <span>{editForm.address}</span>
            )}
            <button type="button" className="edit-button" onClick={() => handleEdit('address')}>Edit</button>
          </div>
          {(editMode.name || editMode.phone || editMode.address) && (
            <button type="submit" className="profile-save-changes-button">Save Changes</button>
          )}
        </form>
      </div>
      <div className="orders-container">
        <h3>My Orders</h3>
        {orders.length ? (
          <ul>
            {orders.map((order) => (
              <li key={order.id}>
                <p>Order #{order.id} - Total: {order.total.toFixed(2)}</p>
                  <div>
                    <strong>Products:</strong>
                     <ul>
                        {order.products.map((productItem) => (
                            <li key={productItem.product.id}>
                              {productItem.product.name} - Qty: {productItem.quantity}
                            </li>
                        ))}
                    </ul>
                  </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>You currently have no orders.</p>
        )}
      </div>
    </div>
  );
}