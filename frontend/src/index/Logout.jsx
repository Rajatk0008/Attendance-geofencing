import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react'; 

const LogoutButton = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    const confirm = window.confirm('Are you sure you want to logout?');
    if (!confirm) return;

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        navigate('/login');
      } else {
        console.error('Logout failed');
        alert('Logout failed');
      }
    } catch (err) {
      console.error('Error during logout:', err);
      alert('Error during logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow hover:bg-red-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <>
          <LogOut className="w-4 h-4" />
          Logout
        </>
      )}
    </button>
  );
};

export default LogoutButton;
