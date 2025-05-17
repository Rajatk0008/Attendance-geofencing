import React, { useState } from 'react';

const UserRegistrationForm = ({ currentUserRole, onRegister }) => {
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '' });
  const [error, setError] = useState('');

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = () => {
    if (!newUser.name || !newUser.email || !validateEmail(newUser.email) || !newUser.role) {
      setError('Please provide valid name, email, and role.');
      return;
    }
    setError('');
    onRegister(newUser);
    setNewUser({ name: '', email: '', role: '' });
  };

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1rem',
      border: '1px solid #ccc',
      borderRadius: '8px',
      background: '#fff',
      maxWidth: '400px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3>➕ Register New User</h3>
      <input
        type="text"
        placeholder="Name"
        value={newUser.name}
        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
        style={inputStyle}
      />
      <input
        type="email"
        placeholder="Email"
        value={newUser.email}
        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
        style={inputStyle}
      />
      <select
        value={newUser.role}
        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
        style={inputStyle}
      >
        <option value="">Select Role</option>
        <option value="user">User</option>
        {currentUserRole === 'superadmin' && <option value="admin">Admin</option>}
        {currentUserRole === 'superadmin' && <option value="superadmin">Superadmin</option>}
      </select>
      <button
        onClick={handleSubmit}
        style={buttonStyle}
      >
        Register
      </button>
      {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  );
};

const inputStyle = {
  padding: '0.5rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
  marginTop: '0.5rem',
  width: '100%',
  boxSizing: 'border-box',
};

const buttonStyle = {
  marginTop: '1rem',
  padding: '0.6rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#3182ce',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 'bold',
  width: '100%',
};

export default UserRegistrationForm;
