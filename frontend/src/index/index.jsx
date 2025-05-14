import React, { useState } from 'react';

const GeofencingAttendance = () => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAttendance = async (actionType) => {
    const trimmedName = name.trim().toLowerCase();

    if (!trimmedName) {
      setStatus("❗ Please enter your name.");
      return;
    }

    if (!navigator.geolocation) {
      setStatus("❌ Geolocation is not supported.");
      return;
    }

    setLoading(true);
    setStatus("📍 Getting location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          console.log("hi")
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: trimmedName,
              latitude: lat,
              longitude: lon,
              action: actionType,
            }),
          });
          console.log(response)
          const data = await response.json();
          setStatus(data.message);
        } catch (error) {
          setStatus("⚠️ Server error: " + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setStatus("⚠️ Location access denied.");
        setLoading(false);
      }
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Mark Attendance</h1>

      <label htmlFor="name">Enter your name:</label><br />
      <input
        type="text"
        id="name"
        placeholder="e.g., Alice"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{ padding: '8px', marginTop: '5px', width: '250px' }}
      />
      <br /><br />

      <button
        className="btn"
        onClick={() => handleAttendance('punch_in')}
        disabled={loading}
      >
        Punch In
      </button>
      <button
        className="btn"
        onClick={() => handleAttendance('punch_out')}
        disabled={loading}
      >
        Punch Out
      </button>

      <p>{status}</p>
      <p><a href="/register">Register a new user</a></p>

      <style>{`
        .btn {
          padding: 10px 15px;
          background-color: #007BFF;
          color: white;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          margin: 5px;
        }
        .btn:hover {
          background-color: #0056b3;
        }
        .btn:disabled {
          background-color: #999;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default GeofencingAttendance;
