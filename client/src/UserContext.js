import React, { useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "./AuthTokenContext";

const UserContext = React.createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const { isAuthenticated } = useAuth0();
  const { accessToken } = useAuthToken();
  const apiUrl = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch(`${apiUrl}/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [isAuthenticated, accessToken]);

  const updateUser = async (updatedUserData) => {
    try {
      const response = await fetch(`${apiUrl}/user`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });

      const userData = await response.json();
      setUser(userData);  // Update local user data with the response
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  const value = { user, setUser, updateUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

const useUser = () => useContext(UserContext);

export { useUser, UserProvider };
