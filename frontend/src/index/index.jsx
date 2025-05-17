import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Header from './header';
import DateSelector from './DateSelector';
import AttendanceStatus from './AttendanceStatus';
import ActionButtons from './ActionButtons';
import StatusMessage from './StatusMessage';
import Clock from './Clock';
import LocationPreview from './LocationPreview';
import '../styles/attendance.css';
import Logout from './Logout';



const GeofencingAttendance = ({ userName }) => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceTimes, setAttendanceTimes] = useState({ punch_in: null, punch_out: null });
  const [coords, setCoords] = useState(null);

  // Animation state
  const [animate, setAnimate] = useState(false);

  const name = userName ? userName.trim().toLowerCase() : '';

  useEffect(() => {
    // Initial entrance animation
    setAnimate(true);

    if (!name) return;
    const fetchAttendance = async () => {
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/user-attendance?name=${encodeURIComponent(name)}&date=${formattedDate}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setAttendanceTimes({
          punch_in: data.punch_in || null,
          punch_out: data.punch_out || null,
        });
      } catch (err) {
        console.error(err);
        setAttendanceTimes({ punch_in: null, punch_out: null });
      }
    };
    fetchAttendance();
  }, [name, selectedDate]);

  const handleAttendance = async (actionType) => {
    if (!name) return setStatus("❗ Unable to determine user name.");
    if (!navigator.geolocation) return setStatus("❌ Geolocation is not supported.");

    setLoading(true);
    setStatus("📍 Getting location...");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setCoords({ lat: coords.latitude, lon: coords.longitude });
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              latitude: coords.latitude,
              longitude: coords.longitude,
              action: actionType,
            }),
          });
          const data = await res.json();
          setStatus(data.message);
          setSelectedDate(new Date());
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

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)',
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    overflow: 'hidden',
    position: 'relative'
  };

  const mainContentStyle = {
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    padding: '20px',
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    opacity: animate ? 1 : 0,
    transform: animate ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05), 0 5px 10px rgba(0, 0, 0, 0.02)',
    padding: '24px',
    marginBottom: '24px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const dateAndStatusContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '24px'
  };

  const dateContainerStyle = {
    ...cardStyle,
    flex: '1',
    minWidth: '250px',
    marginBottom: '0'
  };

  const statusContainerStyle = {
    ...cardStyle,
    flex: '2',
    minWidth: '300px',
    marginBottom: '0'
  };

  const clockContainerStyle = {
    ...cardStyle,
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: '20px',
    paddingBottom: '20px'
  };

  const locationPreviewContainerStyle = {
    ...cardStyle
  };

  const footerStyle = {
    textAlign: 'center',
    padding: '24px',
    color: '#64748b',
    fontSize: '0.875rem'
  };

  // Decorative elements
  const decorCircleStyle = {
    position: 'absolute',
    borderRadius: '50%',
    zIndex: 0
  };

  return (
    <div style={containerStyle}>
      {/* Decorative circles */}
      <div style={{
        ...decorCircleStyle,
        width: '300px',
        height: '300px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        top: '-100px',
        right: '-100px'
      }}></div>
      <div style={{
        ...decorCircleStyle,
        width: '200px',
        height: '200px',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        bottom: '10%',
        left: '-50px'
      }}></div>

      <div style={mainContentStyle}>
        <div style={{
          marginBottom: '24px',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Header userName={userName} size="large" />
          <Logout />
        </div>


        <div style={clockContainerStyle}>
          <Clock />
        </div>

        <div style={dateAndStatusContainerStyle}>
          <div style={dateContainerStyle}>
            <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          </div>
          <div style={statusContainerStyle}>
            <AttendanceStatus selectedDate={selectedDate} times={attendanceTimes} />
          </div>
        </div>

        <div style={cardStyle}>
          <ActionButtons loading={loading} handleAttendance={handleAttendance} />
          <StatusMessage message={status} />
        </div>

        {/* {coords && (
          <div style={locationPreviewContainerStyle}>
            <LocationPreview coords={coords} />
          </div>
        )} */}
      </div>

      <div style={footerStyle}>
        © {new Date().getFullYear()} Attendance Geofencing System | All rights reserved
      </div>
    </div>
  );
};

export default GeofencingAttendance;