import React, { useState, useEffect } from 'react';

export default function UnregisteredUsersAdmin() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/unregistered-users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Error fetching unregistered users:', err));
  }, []);

  const handleAccept = () => {
    if (!selectedUserId) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/unregistered-users/${selectedUserId}/accept`, {
      method: 'POST',
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        setUsers(users.filter(u => u.id !== selectedUserId));
        setSelectedUserId(null);
      })
      .catch(err => console.error(err));
  };

  const handleReject = () => {
    if (!selectedUserId) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/unregistered-users/${selectedUserId}/reject`, {
      method: 'POST',
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        setUsers(users.filter(u => u.id !== selectedUserId));
        setSelectedUserId(null);
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h3>Unregistered Users</h3>
      <select
        value={selectedUserId || ''}
        onChange={e => setSelectedUserId(parseInt(e.target.value))}
      >
        <option value="" disabled>
          Select a user
        </option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.email})
          </option>
        ))}
      </select>

      <div style={{ marginTop: '1em' }}>
        <button onClick={handleAccept} disabled={!selectedUserId}>
          Accept
        </button>
        <button onClick={handleReject} disabled={!selectedUserId} style={{ marginLeft: '1em' }}>
          Reject
        </button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}
