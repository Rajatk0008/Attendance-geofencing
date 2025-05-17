import React from 'react';

const UserFilter = ({ filter, setFilter }) => (
  <div style={{ marginBottom: '20px' }}>
    <label><strong>🔍 Filter Users:</strong></label>
    <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '8px' }}>
      <option value="all">All Users</option>
      <option value="present">Present</option>
      <option value="absent">Absent</option>
    </select>
  </div>
);

export default UserFilter;
