import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { useLoginRedirect } from '../useLoginRedirect';
import { useNavigate } from 'react-router-dom';
import '../style/Header.css';

const Header = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { handleLogout } = useLoginRedirect();
  const navigate = useNavigate();

  const handleAuthentication = () => {
    if (isAuthenticated) {
      handleLogout();
    } else {
      navigate('/login'); 
    }
  };

  return (
    <header className="header">
      <NavLink to="/" className="brand">Pindudu</NavLink>
      <nav className="navigation">
        <NavLink to="/cart">Cart</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        {isAuthenticated && <NavLink to="/debugger">Auth Debugger</NavLink>}
      </nav>
      <button className="loginButton" onClick={handleAuthentication}>
        {isAuthenticated ? 'Log Out' : 'Log In'}
      </button>
    </header>

  );
};

export default Header;
