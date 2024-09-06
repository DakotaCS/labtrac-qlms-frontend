// ./pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './loginPage.css';
import logo from '../../assets/logo.png';  // Updated import for the logo

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://backend.quantuslms.ca/api/login', {
        username,
        password,
      });

      const { jwt } = response.data;
      localStorage.setItem('token', jwt);
      navigate('/inventory');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <>
      <Header />
      <div className="login-container">
        <img src={logo} alt="Logo" />
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit">Login</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
