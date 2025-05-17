import React, { useState } from 'react';

const DeleteUser = ({ currentUserRole }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!email) {
      setMessage({ type: 'error', text: 'Please enter a user email.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/delete-user`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setMessage({ type: 'success', text: `User ${email} deleted successfully.` });
        setEmail('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete user.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error or server down.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="delete-user-container"
      style={{
        marginTop: '2rem',
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        background: '#fff',
        maxWidth: '400px',
      }}
    >
      <h3>Delete User</h3>
      <p>
        Your Role: <strong>{currentUserRole}</strong>
      </p>
      <form onSubmit={handleDelete} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="email"
          placeholder="User Email to delete"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
          disabled={loading}
        />

        {/* Note moved here */}
        <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: 0 }}>
          <strong>Note:</strong> Superadmins can delete anyone. Admins can delete only users with role "user".
        </p>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.5rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: loading ? '#aaa' : '#e53e3e',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Deleting...' : 'Delete User'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '1rem', color: message.type === 'error' ? 'red' : 'green' }}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default DeleteUser;
