import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './loginPage.css';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import logo from '../../assets/logo.png';
import apiClient from '../../config/axiosConfig';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use apiClient instead of axios
      const loginResponse = await apiClient.post('/login', {
        username,
        password,
      });

      const { jwt } = loginResponse.data;
      localStorage.setItem('token', jwt); // Store JWT token

      // Retrieve user ID without sending the token manually
      const userDetailsResponse = await apiClient.get('/system/user/current-user');

      const { id } = userDetailsResponse.data;
      localStorage.setItem('userId', id); // Store user ID in localStorage

      navigate('/landing');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <>
    <Header></Header>
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
      <Footer></Footer>
    </>
  );
};

export default LoginPage;
