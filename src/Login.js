import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import { sanitizeMobile, sanitizeInput, validateMobile, validatePassword } from './utils/validation';
import './App.css';
import styles from './styles/login.module.css';
import Footer from './Footer';

function Login() {
  const navigate = useNavigate();
  const { authDispatch } = useAuth();
  const { walletDispatch } = useWallet();
  const [formData, setFormData] = useState({
    mobile: ''
  });
  const passwordRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Sanitize input based on field type
    let sanitizedValue = value;
    if (name === 'mobile') {
      sanitizedValue = sanitizeMobile(value);
    } else if (name === 'password') {
      sanitizedValue = sanitizeInput(value);
      // Store password in formData for validation
      setFormData({
        ...formData,
        password: sanitizedValue
      });
    } else {
      sanitizedValue = sanitizeInput(value);
    }

    if (name === 'mobile') {
      setFormData({
        ...formData,
        [name]: sanitizedValue
      });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });

    // Validate field on blur
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let error = null;

    switch (fieldName) {
      case 'mobile':
        error = validateMobile(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      default:
        break;
    }

    setErrors({
      ...errors,
      [fieldName]: error
    });

    return !error;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields
    const mobileError = validateMobile(formData.mobile);
    const passwordError = validatePassword(formData.password);

    if (mobileError) {
      newErrors.mobile = mobileError;
      isValid = false;
    }

    if (passwordError) {
      newErrors.password = passwordError;
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({ mobile: true, password: true });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous general errors
    setErrors({ ...errors, general: null });

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for refresh token
        body: JSON.stringify({
          mobile: sanitizeMobile(formData.mobile),
          password: passwordRef.current.value,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        authDispatch({ type: 'SET_USER', payload: data.user });
        authDispatch({ type: 'SET_TOKEN', payload: data.accessToken });
        walletDispatch({ type: 'SET_WALLET_BALANCE', payload: data.user.wallet_balance });
        navigate('/dashboard');
        // Reset form
        setFormData({ mobile: '', password: '' });
        setErrors({});
        setTouched({});
      } else {
        setErrors({
          ...errors,
          general: data.error || 'Login failed. Please check your credentials.'
        });
      }
    } catch (error) {
      setErrors({
        ...errors,
        general: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App">
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h2>Login</h2>

          {errors.general && (
            <div className={styles.errorAlert}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="mobile">Mobile Number</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
                className={errors.mobile && touched.mobile ? styles.inputError : ''}
                required
              />
              {errors.mobile && touched.mobile && (
                <span className={styles.errorText}>{errors.mobile}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                ref={passwordRef}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={errors.password && touched.password ? styles.inputError : ''}
                autoComplete="current-password"
                required
              />
              {errors.password && touched.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className={styles.toggleText}>
            Don't have an account?
            <Link to="/signup" className={styles.toggleBtn}>Sign Up</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
