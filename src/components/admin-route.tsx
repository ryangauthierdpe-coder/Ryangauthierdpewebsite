import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AdminPage } from './admin-page';
import { AdminLogin } from './admin-login';

export function AdminRoute() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if admin session exists on mount
  useEffect(() => {
    const session = sessionStorage.getItem('admin_session');
    if (session) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('admin_session');
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  return isAdminAuthenticated ? (
    <AdminPage onLogout={handleAdminLogout} />
  ) : (
    <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
  );
}
