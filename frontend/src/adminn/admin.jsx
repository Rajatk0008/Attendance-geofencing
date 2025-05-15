import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const AdminPanel = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '' });
  const [userError, setUserError] = useState([]);

  const [presentUsers, setPresentUsers] = useState([]);
  const [absentUsers, setAbsentUsers] = useState([]);

  useEffect(() => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/attendance?date=${formattedDate}`)
      .then(res => res.json())
      .then(data => {
        setAttendanceData(data);

        const present = data.filter(user =>
          user.records.some(r => r.punch_in || r.punch_out)
        );
        const absent = data
          .filter(user => !user.records || user.records.length === 0)
          .map(user => user.name);

        setPresentUsers(present);
        setAbsentUsers(absent);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching attendance:', err);
        setLoading(false);
      });
  }, [selectedDate]);

  const handleUserRegistration = () => {
    if (!newUser.name || !newUser.email || !validateEmail(newUser.email) || !newUser.role) {
      setUserError('Please provide valid name, email, and role.');
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/admin/register-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setNewUser({ name: '', email: '', role: '' });
          setUserError('');
          alert('User registered successfully!');
        } else {
          alert(data.message || 'Error registering user');
        }
      })
      .catch(err => {
        console.error('Error registering user:', err);
        alert('Error registering user');
      });
  };

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f4f4', padding: '20px' }}>
      <h1 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span>📋 Admin Panel - Attendance Dashboard</span>
        <button
          className="download-btn"
          onClick={async () => {
            try {
              const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/download-attendance`, {
                method: 'GET',
                credentials: 'include', // if your API uses cookies/session
              });

              if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to download attendance');
                return;
              }

              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;

              const disposition = response.headers.get('Content-Disposition');
              let filename = 'attendance.xlsx';
              if (disposition && disposition.includes('attachment')) {
                const filenameMatch = disposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length > 1) filename = filenameMatch[1];
              }
              link.download = filename;

              document.body.appendChild(link);
              link.click();
              link.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error('Download error:', err);
              alert('Error downloading the file.');
            }
          }}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ⬇️ Download Excel
        </button>
      </h1>

      {/* Date Picker */}
      <div style={{ margin: '20px 0' }}>
        <label><strong>📅 Select Date:</strong></label>
        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          maxDate={new Date()}
        />
      </div>

      {/* Attendance Table */}
      <h2>✅ Present Users on {format(selectedDate, 'yyyy-MM-dd')}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : presentUsers.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: '#333', color: 'white' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Punch In</th>
              <th style={thStyle}>Punch Out</th>
              <th style={thStyle}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {presentUsers.map((user, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={tdStyle}>{user.name}</td>
                <td style={tdStyle}>{user.records[0]?.punch_in || '---'}</td>
                <td style={tdStyle}>{user.records[0]?.punch_out || '---'}</td>
                <td style={tdStyle}>{user.records[0]?.device_ip || '---'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users are present..</p>
      )}

      {/* Absent Users Section */}
      <h2>❌ Absent Users</h2>
      {absentUsers.length > 0 ? (
        <ul>
          {absentUsers.map((name, idx) => (
            <li key={idx} style={{ color: 'black', fontWeight: 'bold' }}>{name}</li>
          ))}
        </ul>
      ) : (
        <p>Everyone marked attendance.</p>
      )}

      {/* Register New User */}
      <div style={{ marginTop: '30px' }}>
        <h2>Register New User</h2>
        <input
          type="text"
          placeholder="Enter name"
          value={newUser.name}
          onChange={e => setNewUser({ ...newUser, name: e.target.value })}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <input
          type="email"
          placeholder="Enter email"
          value={newUser.email}
          onChange={e => setNewUser({ ...newUser, email: e.target.value })}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <select
          value={newUser.role}
          onChange={e => setNewUser({ ...newUser, role: e.target.value })}
          style={{ padding: '8px', marginRight: '10px' }}
        >
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={handleUserRegistration}
          style={{ padding: '8px 20px', backgroundColor: '#007bff', color: 'white' }}
        >
          Register User
        </button>
        {userError && <p style={{ color: 'red', marginTop: '10px' }}>{userError}</p>}
      </div>

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

// Table styles
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  background: '#fff',
  marginBottom: '40px',
  boxShadow: '0 0 5px rgba(0,0,0,0.1)',
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
