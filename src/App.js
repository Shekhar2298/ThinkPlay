import React, { lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { UserProvider } from './UserContext';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import Navbar from './Navbar';
import AddMoney from './AddMoney';
import MathQuiz from './MathQuiz';
import Footer from './Footer';
import styles from './styles/app.module.css';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
// Lazy load route components
const Login = lazy(() => import('./Login'));
const Signup = lazy(() => import('./Signup'));
const PaymentSuccess = lazy(() => import('./PaymentSuccess'));

function Dashboard() {
  const navigate = useNavigate();
  const { authState, authDispatch } = useAuth();
  const { walletState } = useWallet();
  const { user, token } = authState;
  // const { wallet_balance } = walletState;
  const [showAddMoney, setShowAddMoney] = useState(false);

  // Redirect to login if no token
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    authDispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const handleAddMoney = () => {
    setShowAddMoney(true);
  };

  const handleCloseAddMoney = () => {
    setShowAddMoney(false);
  };

  if (!token || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.App}>
      <Navbar onLogout={handleLogout} onAddMoney={handleAddMoney} />
      <div className="user-info">
        {/* <span>HI, {user?.mobile}</span> */}
      </div>
      <div className="dashboard">
        <MathQuiz />
      </div>
      {showAddMoney && <AddMoney onClose={handleCloseAddMoney} />}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/adm-lg" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/" element={<Login />} />
        </Routes>

      </Router>
    </UserProvider>
  );
}

export default App;
