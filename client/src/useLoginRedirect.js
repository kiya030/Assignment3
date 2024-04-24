import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export const useLoginRedirect = () => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!isAuthenticated) {
     // Save the last path only if it's not the login page
     if (location.pathname !== '/login') {
      sessionStorage.setItem('lastPath', location.pathname);
    }
      loginWithRedirect();
    } else {
      let lastPath = sessionStorage.getItem('lastPath') || '/';
      sessionStorage.removeItem('lastPath');
      navigate(lastPath);
    }
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
    sessionStorage.removeItem('lastPath'); // Clear the last path on logout
  };

  return { handleLogin, handleLogout };
};
