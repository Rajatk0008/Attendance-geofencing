import React, { useEffect, useState } from 'react';

const AdminPanel = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/attendance`)  
      .then(res => res.json())
      .then(data => {
        setUserData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching attendance data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f4f4', padding: '20px' }}>
      <h1 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        📋 Admin Panel - Attendance Records
        <a
          className="download-btn"
          href="/api/admin/download-attendance"
        >
          ⬇️ Download Excel
        </a>
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        userData.map(user => (
          <div key={user.name}>
            <h2 style={{ marginTop: '30px' }}>{user.name}</h2>
            {user.records && user.records.length > 0 ? (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: '#fff',
                marginBottom: '40px',
                boxShadow: '0 0 5px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ background: '#333', color: 'white' }}>
                    <th style={thStyle}>Punch In</th>
                    <th style={thStyle}>Punch Out</th>
                    <th style={thStyle}>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {user.records.map((record, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                      <td style={tdStyle}>{record.punch_in}</td>
                      <td style={tdStyle}>{record.punch_out || '---'}</td>
                      <td style={tdStyle}>{record.device_ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No attendance records found.</p>
            )}
          </div>
        ))
      )}

      <style>{`
        .download-btn {
          background-color: #28a745;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
        }
        .download-btn:hover {
          background-color: #218838;
        }
      `}</style>
    </div>
  );
};

const thStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  textAlign: 'left',
};

const tdStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  textAlign: 'left',
};

export default AdminPanel;
