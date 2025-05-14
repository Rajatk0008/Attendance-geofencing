import React, { useState } from 'react';

const RegisterUser = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('⚠️ Registration failed: ' + error.message);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      <h1>User Registration</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Enter your name:</label><br />
        <input
          type="text"
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '8px', marginTop: '5px', width: '250px' }}
        /><br /><br />
        <input type="submit" value="Register" style={{ padding: '8px 16px' }} />
      </form>

      <br />
      <a href="/" onClick={(e) => {
        e.preventDefault();
        window.location.href = '/'; // or use React Router navigation
      }}>
        Go to Attendance Page
      </a>

      {message && (
        <script dangerouslySetInnerHTML={{ __html: `alert(${JSON.stringify(message)});` }} />
      )}
    </div>
  );
};

export default RegisterUser;
