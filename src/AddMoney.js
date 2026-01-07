import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import { useNavigate } from 'react-router-dom';
import { sanitizeInput, validateAmount } from './utils/validation';
import styles from './styles/AddMoney.module.css';

function AddMoney({ onClose }) {
  const { authState, authDispatch } = useAuth();
  const { walletDispatch } = useWallet();
  const { user, token } = authState;
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(sanitizeInput(value));

    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleAmountBlur = () => {
    setTouched(true);
    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate amount
    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      setTouched(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch("http://localhost:5000/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include', // Include cookies in request
        body: JSON.stringify({ amount })
      });

      const order = await res.json();

      if (!res.ok) {
        setError(order.error || "Failed to create order");
        return;
      }

      // Razorpay checkout options
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Math Quiz Game',
        description: 'Add Money to Wallet',
        order_id: order.orderId,
        handler: function (response) {
          // Handle payment success
          verifyPayment(response);
        },
        prefill: {
          name: user.mobile,
          email: '',
          contact: user.mobile
        },
        theme: {
          color: '#3399cc'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setError('Failed to create payment session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (response) => {
    try {
      const res = await fetch("http://localhost:5000/api/razorpay/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      });

      const result = await res.json();

      if (res.ok) {
        alert('Payment successful! Wallet updated.');
        // Fetch updated user data to update wallet balance in context
        try {
          const userResponse = await fetch('http://localhost:5000/api/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            authDispatch({ type: 'SET_USER', payload: userData });
            walletDispatch({ type: 'SET_WALLET_BALANCE', payload: userData.wallet_balance });
          }
        } catch (error) {
          console.error('Error fetching updated user data:', error);
        }
        onClose(); // Close the modal
      } else {
        alert('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      alert('Payment verification failed. Please contact support.');
    }
  };

  return (
    <div className={styles['add-money-overlay']}>
      <div className={styles['add-money-modal']}>
        <h2>Add Money to Wallet</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="amount">Amount (INR)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              step="0.01"
              required
            />
          </div>
          {error && <div className={styles['error-message']}>{error}</div>}
          <div className={styles['button-group']}>
            <button type="button" onClick={onClose} className={styles['cancel-btn']}>Cancel</button>
            <button type="submit" disabled={loading} className={styles['submit-btn']}>
              {loading ? 'Processing...' : 'Add Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMoney;
