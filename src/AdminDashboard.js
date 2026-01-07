
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/adminDashboard.module.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if admin is logged in by verifying cookies
    const checkAdminAuth = async () => {
      try {
        // Since tokens are in httpOnly cookies, we need to make a request to verify
        const response = await fetch('http://localhost:5000/api/admin/me', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const data = await response.json();
          setAdminData(data);

          // Fetch admin statistics
          const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
            method: 'GET',
            credentials: 'include',
          });

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData);
          } else {
            console.error('Failed to fetch admin stats');
          }
        } else {
          // Not authenticated, redirect to admin login
          navigate('/adm-lg');
        }
      } catch (err) {
        setError('Failed to verify admin authentication');
        navigate('/adm-lg');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        method: 'GET',
        credentials: 'include',
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        console.error('Failed to fetch admin stats');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/adm-lg');
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout on client side
      navigate('/adm-lg');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.adminDashboard}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <main className={styles.main}>
        {stats && (
          <div className={styles.statsSection}>
            <h3>System Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h4>Total Users</h4>
                <p className={styles.statNumber}>{stats.totalUsers}</p>
              </div>
              <div className={styles.statCard}>
                <h4>Total Wallet Balance</h4>
                <p className={styles.statNumber}>₹{stats.totalWalletBalance}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
