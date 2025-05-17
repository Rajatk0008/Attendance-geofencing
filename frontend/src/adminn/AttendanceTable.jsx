import React from 'react';

const formatTime = (datetime) => {
  if (!datetime) return '---';
  const date = new Date(datetime);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const AttendanceTable = ({ users }) => {
  const presentUsers = users.filter(
    (user) => user.records?.[0]?.punch_in || user.records?.[0]?.punch_out
  );
  const absentUsers = users.filter(
    (user) => !user.records?.[0]?.punch_in && !user.records?.[0]?.punch_out
  );

  const renderUserRow = (user, idx) => {
    const record = user.records?.[0] || {};
    const isPresent = record.punch_in || record.punch_out;
    return (
      <tr key={`${user.email}-${idx}`} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
        <td>{user.name}</td>
        <td>{formatTime(record.punch_in)}</td>
        <td>{formatTime(record.punch_out)}</td>
        <td>{record.device_ip || '---'}</td>
        <td style={{ color: isPresent ? 'green' : 'red', fontWeight: 'bold' }}>
          {isPresent ? 'Present' : 'Absent'}
        </td>
      </tr>
    );
  };

  return users.length > 0 ? (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
      <thead>
        <tr style={{ background: '#333', color: 'white' }}>
          <th>Name</th>
          <th>Punch In</th>
          <th>Punch Out</th>
          <th>IP</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {presentUsers.map(renderUserRow)}
        {presentUsers.length > 0 && absentUsers.length > 0 && (
          <tr><td colSpan="5" style={{ height: '10px' }}></td></tr>
        )}
        {absentUsers.map(renderUserRow)}
      </tbody>
    </table>
  ) : (
    <p>No users found for this filter.</p>
  );
};

export default AttendanceTable;
