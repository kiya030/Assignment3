import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { AuthTokenProvider } from "./AuthTokenContext";
import { UserProvider } from './UserContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Homepage';
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header';
import VerifyUser from './components/VerifyUser';
import AuthDebugger from './pages/AuthDebugger';
import { useLoginRedirect } from './useLoginRedirect';
import DetailsPage from './pages/DetailsPage';
import Cart from './pages/Cart';
import { CartProvider } from './AppContext';
import LoginPage from './pages/LoginPage';


const root = ReactDOM.createRoot(document.getElementById('root'));

const requestedScopes = ["profile", "email"];

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();
  const { handleLogin } = useLoginRedirect();


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    handleLogin();
    return <div>Redirecting to login...</div>;
  }

  // Otherwise, display the children (the protected page)
  return children;
}

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/verify-user`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>
        <BrowserRouter>
          <CartProvider>
            <UserProvider>
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/details/:productId" element={<DetailsPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/verify-user" element={<VerifyUser />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={
                  <RequireAuth>
                    <ProfilePage />
                  </RequireAuth>
                } />
                <Route path="debugger" element={
                  <RequireAuth>
                    <AuthDebugger />
                  </RequireAuth>
                } />
              </Routes>
            </UserProvider>
          </CartProvider>
        </BrowserRouter>
      </AuthTokenProvider>
    </Auth0Provider>
  </React.StrictMode>
);

