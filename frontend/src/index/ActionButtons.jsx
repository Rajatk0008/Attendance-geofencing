import React from 'react';

const ActionButtons = ({ loading, handleAttendance }) => {
  // Common button styles
  const buttonBaseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    minWidth: '160px',
    position: 'relative',
    overflow: 'hidden'
  };

  // Button container styles
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  };

  // Punch In button styles
  const punchInStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#4F46E5',
    color: 'white',
    opacity: loading ? 0.7 : 1,
    transform: loading ? 'scale(0.98)' : 'scale(1)',
  };

  // Punch Out button styles
  const punchOutStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#4F46E5',
    color: 'white',
    opacity: loading ? 0.7 : 1,
    transform: loading ? 'scale(0.98)' : 'scale(1)',
  };

  // Loading ripple effect styles
  const rippleStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: 'scale(0)',
    animation: loading ? 'ripple 1s infinite ease-out' : 'none',
    top: 0,
    left: 0
  };

  // Icon style
  const iconStyle = {
    marginRight: '8px',
    fontSize: '18px'
  };

  return (
    <div style={containerStyle}>
      <button
        style={punchInStyle}
        title="Mark your Punch In time"
        onClick={() => handleAttendance('punch_in')}
        disabled={loading}
        onMouseOver={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = '#4F46E5';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
          }
        }}
        onMouseOut={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = '#4F46E5';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }
        }}
      >
        {loading && <div style={rippleStyle}></div>}
        <span style={iconStyle}>⏱️</span>
        <span>Punch In</span>
      </button>

      <button
        style={punchOutStyle}
        title="Mark your Punch Out time"
        onClick={() => handleAttendance('punch_out')}
        disabled={loading}
        onMouseOver={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = '#4F46E5';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
          }
        }}
        onMouseOut={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = '#4F46E5';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }
        }}
      >
        {loading && <div style={rippleStyle}></div>}
        <span style={iconStyle}>🏁</span>
        <span>Punch Out</span>
      </button>

      <style>
        {`
          @keyframes ripple {
            0% {
              transform: scale(0);
              opacity: 1;
            }
            100% {
              transform: scale(4);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ActionButtons;