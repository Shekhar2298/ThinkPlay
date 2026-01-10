import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import styles from './styles/transactionHistory.module.css';

function TransactionHistory() {
  const { authState } = useAuth();
  const { token } = authState;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions?page=1&limit=20', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        setError('Failed to load transaction history');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h3>Transaction History</h3>
        <div className={styles.loading}>Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h3>Transaction History</h3>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3>Transaction History</h3>
      {transactions.length === 0 ? (
        <div className={styles.empty}>No transactions found</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Order ID</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{formatDate(transaction.created_at)}</td>
                  <td className={`${styles.type} ${styles[transaction.type]}`}>
                    {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                  </td>
                  <td className={styles.amount}>
                    ₹{parseFloat(transaction.amount).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={styles.status}
                      style={{ backgroundColor: getStatusColor(transaction.status) }}
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td className={styles.orderId}>{transaction.order_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
