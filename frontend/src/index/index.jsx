import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const GeofencingAttendance = () => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // New states for calendar and attendance times
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceTimes, setAttendanceTimes] = useState({ punch_in: null, punch_out: null });

  // Fetch attendance info for the user on selectedDate whenever name or selectedDate changes
  useEffect(() => {
    if (!name.trim()) {
      setAttendanceTimes({ punch_in: null, punch_out: null });
      return;
    }

    const fetchAttendance = async () => {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/user-attendance?name=${encodeURIComponent(name.trim().toLowerCase())}&date=${formattedDate}`);
        if (!res.ok) {
          setAttendanceTimes({ punch_in: null, punch_out: null });
          return;
        }
        const data = await res.json();

        setAttendanceTimes({
          punch_in: data.punch_in || null,
          punch_out: data.punch_out || null,
        });
      } catch (err) {
        console.error('Error fetching attendance times:', err);
        setAttendanceTimes({ punch_in: null, punch_out: null });
      }
    };

    fetchAttendance();
  }, [name, selectedDate]);

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

          const data = await response.json();
          setStatus(data.message);

          // Refetch attendance times for today after punch in/out
          if (actionType === 'punch_in' || actionType === 'punch_out') {
            setSelectedDate(new Date()); // reset to today (optional)
          }
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

      {/* Calendar */}
      <div style={{ margin: '20px 0' }}>
        <label><strong>Select Date:</strong></label><br />
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          maxDate={new Date()}
        />
      </div>

      {/* Show punch in/out times for selected date */}
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Attendance for {format(selectedDate, 'yyyy-MM-dd')}:</strong></p>
        <p>Punch In: {attendanceTimes.punch_in ? attendanceTimes.punch_in : '---'}</p>
        <p>Punch Out: {attendanceTimes.punch_out ? attendanceTimes.punch_out : '---'}</p>
      </div>

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
