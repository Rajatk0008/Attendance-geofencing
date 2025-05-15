import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
  const history = useNavigate();

  useEffect(() => {
    // Get the token from the URL or any other data returned by the backend
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token'); // Assuming token is passed as query parameter

    if (token) {
      // Save the token to localStorage or context
      localStorage.setItem('auth_token', token);

      // Optionally, you can also store user info, like email
      axios.get('http://localhost:5000/user', {
        headers: { Authorization: `Bearer ${token}` }
      }).then((response) => {
        // Save user data to localStorage or context if needed
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Redirect to the homepage or wherever needed
        history.push('/');
      }).catch(error => {
        console.error('Error fetching user data', error);
      });
    }
  }, [history]);

  return (
    <div className="auth-callback">
      <h2>Authenticating...</h2>
    </div>
  );
};

export default AuthCallback;
