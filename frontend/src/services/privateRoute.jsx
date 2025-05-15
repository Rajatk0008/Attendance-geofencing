import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const PrivateRoute = ({ element }) => {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    // Check session with /api/me
    axios.get('/api/me', { withCredentials: true })
      .then(response => {
        setAuthenticated(true);
      })
      .catch(error => {
        setAuthenticated(false);
      });
  }, []);

  if (authenticated === null) return <div>Loading...</div>;  // Handle loading state

  return authenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
