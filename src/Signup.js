import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './App.css';

function Signup() {
  const navigate = useNavigate();
  const { dispatch } = useUser();
  const [formData, setFormData] = useState({
    mobile: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for refresh token
        body: JSON.stringify({
          mobile: formData.mobile,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_USER', payload: data.user });
        dispatch({ type: 'SET_TOKEN', payload: data.token });
        dispatch({ type: 'SET_WALLET_BALANCE', payload: data.user.wallet_balance });
        navigate('/dashboard');
        setFormData({
          mobile: '',
          password: ''
        });
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  // Helper function to get cookie value
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };


  return (
    <div className="App">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="mobile">Mobile</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="submit-btn">Sign Up</button>
          </form>
          <p className="toggle-text">
            Already have an account?
            <Link to="/login" className="toggle-btn">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
