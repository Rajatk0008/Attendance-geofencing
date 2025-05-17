import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DateSelector from './DateSelector';
import UserFilter from './UserFilter';
import AttendanceTable from './AttendanceTable';
import UserRegistrationForm from './UserRegistrationForm';
import DeleteUser from './DeleteUser';
import DownloadButton from './DownloadButton';
import '../styles/AdminPanel.css';
import LogoutButton from './LogoutButton';
import UnregisteredUsersAdmin from './Dropdown'; // adjust path if needed
import KPIStats from './KPIstats'; // Adjust the path as needed
import UpdateUserForm from './UpdateUserForm';
import UpdateAttendanceForm from './ManualPunchUpdate';




const AdminPanel = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState('');
  

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setCurrentUserRole(data.role);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/attendance?date=${formattedDate}`, {
          credentials: 'include',
        });
        const data = await res.json();
        setAttendanceData(data);
      } catch {
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [selectedDate]);

  const getFilteredUsers = () => {
    if (filter === 'present') return attendanceData.filter(u => u.records?.some(r => r.punch_in || r.punch_out));
    if (filter === 'absent') return attendanceData.filter(u => !u.records || u.records.length === 0);
    return attendanceData;
  };

  const handleRegister = async (newUser) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/register-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
      credentials: 'include',
    });
    const data = await res.json();
    if (res.ok && data.status === 'success') alert('✅ User registered');
    else alert(data.message || '❌ Error');
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/download-attendance`, {
        method: 'GET',
        credentials: 'include',
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'attendance.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed');
    }
  };

  const totalEmployees = attendanceData.length;
  const presentUsers = attendanceData.filter(u => u.records?.some(r => r.punch_in || r.punch_out)).length;
  const absentUsers = totalEmployees - presentUsers;


  return (
    <div className="admin-panel-container">
      <div className="admin-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>📋 Admin Panel</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <DownloadButton onDownload={handleDownload} />
          <LogoutButton />
        </div>
      </div>


      <KPIStats total={totalEmployees} present={presentUsers} absent={absentUsers} />


      <div className="attendance-heading-row">
        <h2>👥 Attendance on {format(selectedDate, 'yyyy-MM-dd')}</h2>
        <div className="controls-inline">
          <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          <UserFilter filter={filter} setFilter={setFilter} />
        </div>
      </div>

      {loading ? <p>Loading...</p> : <AttendanceTable users={getFilteredUsers()} />}

      {/* Dropdown for Unregistered Users */}
      <div style={{ marginTop: '2rem' }}>
        <UnregisteredUsersAdmin />
      </div>

      {/* Side-by-side cards container */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <UserRegistrationForm currentUserRole={currentUserRole} onRegister={handleRegister} />
        <DeleteUser currentUserRole={currentUserRole} />
        <UpdateUserForm />
        <UpdateAttendanceForm />
      </div>

    </div>
  );
};
export default AdminPanel;
