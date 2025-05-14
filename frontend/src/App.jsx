import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GeofencingAttendance from './index/index';
import RegisterUser from './register/register';
import AdminPanel from './adminn/admin'; // Optional

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GeofencingAttendance />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/admin" element={<AdminPanel />} /> {/* Optional */}
      </Routes>
    </Router>
  );
};

export default App;
