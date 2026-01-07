import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from './Footer';
import styles from './styles/login.module.css';
import { sanitizeMobile, sanitizeInput, validateMobile, validatePassword } from './utils/validation';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mobile: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Sanitize input based on field type
    let sanitizedValue = value;
    if (name === 'mobile') {
      sanitizedValue = sanitizeMobile(value);
    } else {
      sanitizedValue = sanitizeInput(value);
    }

    setFormData({
      ...formData,
      [name]: sanitizedValue
    });

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
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for secure admin session
        body: JSON.stringify({
          mobile: sanitizeMobile(formData.mobile),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Admin login successful, redirect to admin dashboard
        navigate('/admin-dashboard');
        // Reset form
        setFormData({ mobile: '', password: '' });
        setErrors({});
        setTouched({});
      } else {
        setErrors({
          ...errors,
          general: data.error || 'Admin login failed. Please check your credentials.'
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
          <h2>Admin Login</h2>

          {errors.general && (
            <div className={styles.errorAlert}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="mobile">Admin Mobile Number</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter admin mobile number"
                maxLength="10"
                className={errors.mobile && touched.mobile ? styles.inputError : ''}
                required
              />
              {errors.mobile && touched.mobile && (
                <span className={styles.errorText}>{errors.mobile}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Admin Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter admin password"
                className={errors.password && touched.password ? styles.inputError : ''}
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
              {isSubmitting ? 'Logging in...' : 'Admin Login'}
            </button>
          </form>

          <p className={styles.toggleText}>
            <Link to="/dashboard" className={styles.toggleBtn}>Go to Game</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLogin;
