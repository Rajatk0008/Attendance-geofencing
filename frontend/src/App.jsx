import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import GeofencingAttendance from './index/index';
import RegisterUser from './register/register';
import AdminPanel from './adminn/admin';
import LoginPage from './login/login';
import UnregisteredPage from './login/unregistered';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [redirect, setRedirect] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          setRedirect('/login');
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then(data => {
        if (!data.email || !data.role) {
          setRedirect('/unregistered');
        } else {
          setAuthenticated(true);
        }
      })
      .catch(err => {
        console.error('Auth check failed:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && redirect) {
      navigate(redirect, { replace: true });
    }
  }, [redirect, loading, navigate]);

  if (loading) return <div>Loading...</div>;
  return authenticated ? children : null;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Always redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/unregistered" element={<UnregisteredPage />} />
        <Route path="/register" element={<RegisterUser />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <GeofencingAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
