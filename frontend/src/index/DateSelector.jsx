import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateSelector = ({ selectedDate, setSelectedDate, label = "Select Date" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      {/* <div className="mb-1 text-sm font-medium text-gray-700">{label}</div> */}

      <div
        className="relative w-full mb-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-full p-2 mb-4 bg-white border border-gray-300 rounded-md shadow-sm hover:border-blue-500 cursor-pointer transition-colors">
          
            <span className="mr-2 text-sm text-gray-500">📅</span>
            <span className="text-gray-400">Select Date</span>
          
        </div>



        <div className={`absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg ${!isOpen && "hidden"}`}>
          <div className="p-2">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              inline
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              className="border-none shadow-none"
              calendarClassName="border-none shadow-none"
            />
          </div>
        </div>
      </div>

      {/* Hidden DatePicker for accessibility/fallback */}
      {/* <div className="hidden">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          maxDate={new Date()}
        />
      </div> */}
    </div>
  );
};

export default DateSelector;
