// src/hooks/useAuth.js
import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:3001/api';

const useAuth = (staffList, onLoginSuccess, onLogout) => {
  const [authLevel, setAuthLevel] = useState('logged_out'); 
  const [loggedInStaff, setLoggedInStaff] = useState(null);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async () => {
    try {
        const response = await fetch(`${API_URL}/auth/business/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loginEmail, password: loginPassword }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Đăng nhập thất bại.');
        }
        
        localStorage.setItem('authToken', data.token);
        setLoggedInStaff(data.user);
        setAuthLevel('business_auth');
        onLoginSuccess(false); // is not admin
        setLoginEmail('');
        setLoginPassword('');

    } catch(error) {
        alert(error.message);
    }
  };
  
  const handleAdminLogin = async () => {
    try {
        const response = await fetch(`${API_URL}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loginEmail, password: loginPassword }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        localStorage.setItem('authToken', data.token);
        setLoggedInStaff(data.user);
        setAuthLevel('admin_auth');
        onLoginSuccess(true);
        setLoginEmail('');
        setLoginPassword('');
    } catch(error) {
        alert(error.message);
    }
  };

  const handleStaffLogin = (staffId, pin) => {
    const staffMember = staffList.find(s => s.id.toString() === staffId.toString());
    if (staffMember && staffMember.pin === pin) {
      setLoggedInStaff(staffMember);
      setAuthLevel('staff_auth');
      onLoginSuccess(false);
    } else {
      alert('Mã PIN không chính xác.');
    }
  };

  const handleStaffLogout = () => {
    setLoggedInStaff(null);
    setAuthLevel('business_auth');
  };
  
  const handleBusinessLogout = () => {
    localStorage.removeItem('authToken');
    setLoggedInStaff(null);
    setAuthLevel('logged_out');
    setLoginEmail('');
    setLoginPassword('');
    onLogout();
  };

  return {
    authLevel,
    loggedInStaff,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    handleLogin,
    handleAdminLogin,
    handleStaffLogin,
    handleStaffLogout,
    handleBusinessLogout,
  };
};

export default useAuth;