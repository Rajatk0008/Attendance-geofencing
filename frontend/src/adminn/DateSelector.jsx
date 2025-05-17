import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateSelector = ({ selectedDate, setSelectedDate }) => (
  <div style={{ marginBottom: '20px' }}>
    <label><strong>📅 Select Date:</strong></label>
    <DatePicker
      selected={selectedDate}
      onChange={setSelectedDate}
      dateFormat="yyyy-MM-dd"
      maxDate={new Date()}
    />
  </div>
);

export default DateSelector;
