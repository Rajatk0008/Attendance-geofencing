import React from 'react';

const KPIBox = ({ label, count, color }) => (
  <div style={{
    backgroundColor: color || '#f0f0f0',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    minWidth: '150px',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    flex: '1',
  }}>
    <h3 style={{ margin: 0, fontSize: '2rem' }}>{count}</h3>
    <p style={{ margin: 0, fontSize: '1rem' }}>{label}</p>
  </div>
);

const KPIStats = ({ total, present, absent }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '1.5rem',
      margin: '1rem 0',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
    }}>
      <KPIBox label="Total Employees" count={total} color="#E0F7FA" />
      <KPIBox label="Present Users" count={present} color="#C8E6C9" />
      <KPIBox label="Absent Users" count={absent} color="#FFCDD2" />
    </div>
  );
};

export default KPIStats;
