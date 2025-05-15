import React from 'react';

const LoginPage = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/login'; // Your Flask login endpoint
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Please Sign in to Continue</h2>
      <button onClick={handleLogin}>Sign in with Google</button>
    </div>
  );
};

export default LoginPage;
