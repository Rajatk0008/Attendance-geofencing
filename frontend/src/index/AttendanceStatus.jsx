import React from 'react';
import { format } from 'date-fns';

const AttendanceStatus = ({ selectedDate, times }) => {
  // Format the date in a more readable format
  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
  
  // Container styles
  const containerStyle = {
    padding: '4px'
  };
  
  // Header styles
  const headerStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };
  
  // Date pill style
  const datePillStyle = {
    backgroundColor: '#EFF6FF',
    color: '#3B82F6',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '500'
  };
  
  // Card styles for punch times
  const timeCardsContainerStyle = {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  };
  
  const timeCardStyle = {
    flex: '1',
    minWidth: '120px',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  };
  
  const punchInCardStyle = {
    ...timeCardStyle,
    backgroundColor: '#F0FDF4',
    border: '1px solid #DCFCE7'
  };
  
  const punchOutCardStyle = {
    ...timeCardStyle,
    backgroundColor: '#FFF7ED',
    border: '1px solid #FFEDD5'
  };
  
  const timeCardLabelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#6B7280',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };
  
  const timeCardValueStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1F2937'
  };

  const missingTimeStyle = {
    ...timeCardValueStyle,
    color: '#9CA3AF',
    fontSize: '18px'
  };
  
  // Status indicator
  const getStatusIndicator = (time) => {
    if (!time) return null;
    
    return (
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#10B981',
        marginLeft: '8px'
      }}></div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span>Attendance Status</span>
        <span style={datePillStyle}>{formattedDate}</span>
      </div>
      
      <div style={timeCardsContainerStyle}>
        <div style={punchInCardStyle}>
          <div style={timeCardLabelStyle}>
            <span>✅ Punch In</span>
            {getStatusIndicator(times.punch_in)}
          </div>
          <div style={times.punch_in ? timeCardValueStyle : missingTimeStyle}>
            {times.punch_in || 'Not Recorded'}
          </div>
        </div>
        
        <div style={punchOutCardStyle}>
          <div style={timeCardLabelStyle}>
            <span>🏁 Punch Out</span>
            {getStatusIndicator(times.punch_out)}
          </div>
          <div style={times.punch_out ? timeCardValueStyle : missingTimeStyle}>
            {times.punch_out || 'Not Recorded'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStatus;