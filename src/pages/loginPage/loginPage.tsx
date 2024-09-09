import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './loginPage.css';
import logo from '../../assets/logo.png';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Call login API
      const loginResponse = await axios.post('https://backend.labtrac.quantuslms.ca/api/login', {
        username,
        password,
      });

      const { jwt } = loginResponse.data;
      localStorage.setItem('token', jwt); // Store JWT token

      // 2. Call the additional endpoint to retrieve user ID
      const userDetailsResponse = await axios.get('https://backend.labtrac.quantuslms.ca/api/system/user/current-user', {
        headers: {
          Authorization: `Bearer ${jwt}`, // Send the token in the Authorization header
        },
      });

      const { userId } = userDetailsResponse.data;
      localStorage.setItem('userId', userId); // Store user ID in localStorage

      // 3. Redirect to the landing page
      navigate('/landing');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <>
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
    </>
  );
};

export default LoginPage;
