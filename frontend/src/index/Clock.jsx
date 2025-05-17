import { useEffect, useState } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Format hours, minutes, and seconds with leading zeros
  const hours = (time.getHours() % 12 || 12).toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  // Get AM/PM
  const ampm = time.getHours() >= 12 ? 'PM' : 'AM';
  
  // Get current date
  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const currentDate = time.toLocaleDateString('en-US', dateOptions);
  
  return (
    <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white max-w-md mx-auto">
      <div className="flex flex-col items-center">
        <div className="text-xs font-semibold mb-1">{currentDate}</div>
        
        <div className="flex items-center">
          <span className="text-4xl font-bold tracking-tight">{hours}:{minutes}:{seconds}</span>
          <span className="text-sm ml-2 font-medium">{ampm}</span>
        </div>
      </div>
    </div>
  );
};

export default Clock;