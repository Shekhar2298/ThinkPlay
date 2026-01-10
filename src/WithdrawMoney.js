import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import { sanitizeInput } from './utils/validation';
import styles from './styles/WithdrawMoney.module.css';

function WithdrawMoney({ onClose }) {
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
    const validationError = validateWithdrawalAmount(amount);
    if (validationError) {
      setError(validationError);
    }
  };

  const validateWithdrawalAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      return 'Please enter a valid amount';
    }
    if (numAmount < 100) {
      return 'Minimum withdrawal amount is ₹100';
    }
    if (numAmount > user.wallet_balance) {
      return 'Insufficient wallet balance';
    }
    if (numAmount <= 0) {
      return 'Amount must be greater than 0';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate amount
    const validationError = validateWithdrawalAmount(amount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch("http://localhost:5000/api/razorpay/create-withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        credentials: 'include', // Include cookies in request
        body: JSON.stringify({ amount })
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to initiate withdrawal");
        return;
      }

      // Show success message and close modal
      alert('Withdrawal request submitted successfully! You will receive the amount in your UPI account within a few minutes.');
      onClose();

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

    } catch (error) {
      setError('Failed to process withdrawal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['withdraw-money-overlay']}>
      <div className={styles['withdraw-money-modal']}>
        <h2>Withdraw Money</h2>
        <div className={styles['wallet-info']}>
          <p>Current Balance: ₹{user.wallet_balance}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="amount">Amount (INR)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              placeholder="Enter amount (min ₹100)"
              min="100"
              step="0.01"
              required
            />
            <small className={styles['help-text']}>Minimum withdrawal: ₹100</small>
          </div>
          {error && <div className={styles['error-message']}>{error}</div>}
          <div className={styles['button-group']}>
            <button type="button" onClick={onClose} className={styles['cancel-btn']}>Cancel</button>
            <button type="submit" disabled={loading} className={styles['submit-btn']}>
              {loading ? 'Processing...' : 'Withdraw Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WithdrawMoney;
