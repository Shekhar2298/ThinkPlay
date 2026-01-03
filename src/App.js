import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { UserProvider, useUser } from './UserContext';
import Navbar from './Navbar';
import AddMoney from './AddMoney';
import MathQuiz from './MathQuiz';
import Footer from './Footer';
import './App.css';
import './App.css';

// Lazy load route components
const Login = lazy(() => import('./Login'));
const Signup = lazy(() => import('./Signup'));
const PaymentSuccess = lazy(() => import('./PaymentSuccess'));

function Dashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useUser();
  const { user, token, wallet_balance } = state;
  const [showAddMoney, setShowAddMoney] = useState(false);

  // Redirect to login if no token
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
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
    <div className="App">
      <Navbar walletBalance={wallet_balance} onLogout={handleLogout} onAddMoney={handleAddMoney} />
      <div className="user-info">
        <span>HI, {user?.mobile}</span>
      </div>
      <div className="dashboard">
      
        <p>Start your math quiz game here.</p>
        <MathQuiz />
      </div>
      {showAddMoney && <AddMoney onClose={handleCloseAddMoney} />}
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
