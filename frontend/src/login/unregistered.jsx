import React from 'react';
import RequestRegistrationForm from './RequestRegistration'; // adjust the path if needed

const Unregistered = () => {
  const handleBackToLogin = () => {
    window.location.href = '/'; // or use navigate('/') if using react-router
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to bottom right, #FEF2F2, #FEE2E2)',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)',
        padding: '40px',
        textAlign: 'center'
      }}>
        {/* Alert icon */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          backgroundColor: '#FEE2E2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Access denied message */}
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '16px' }}>Access Denied</h1>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#6B7280', marginBottom: '32px' }}>
          Your email address is not registered. You can request access using the form below.
        </p>

        {/* Back to login button */}
        <button
          onClick={handleBackToLogin}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '14px 24px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Return to Login
        </button>

        {/* Contact info */}
        <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '24px' }}>
          Or contact <a href="mailto:admin@gmail.com" style={{ color: '#DC2626', fontWeight: '500', textDecoration: 'none' }}>admin@gmail.com</a>
        </p>

        <hr style={{ marginBottom: '24px', borderColor: '#E5E7EB' }} />

        {/* User Registration Form Component */}
        <RequestRegistrationForm />
      </div>
    </div>
  );
};

export default Unregistered;
