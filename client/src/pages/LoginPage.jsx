import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useLoginRedirect } from '../useLoginRedirect';
import { useNavigate } from 'react-router-dom';
import '../style/LoginPage.css';


const LoginPage = () => {
  const navigate = useNavigate();
  const { handleLogin } = useLoginRedirect();

  return (
    <div className="login-page">
      <h1 className="login-page__title">Join Pindudu Today</h1>
      <p className="login-page__description">Explore the trendiest products that inspire you</p>
      <div className="login-page__button-container">
        <button onClick={handleLogin} className="login-page__button login-page__button--login">Login</button>
        <button className="login-page__button login-page__button--create">Create Account</button>
      </div>
      <footer className="login-page__footer">
        Be Bold, Be Techy – Gear Up in Style.
      </footer>
    </div>
  );
};

export default LoginPage;