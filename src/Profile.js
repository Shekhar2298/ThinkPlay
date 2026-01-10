import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import styles from './styles/profile.module.css';

function Profile({ onClose }) {
  const { authState } = useAuth();
  const { token } = authState;
  const [activeTab, setActiveTab] = useState('bank');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifsc: '',
    holderName: ''
  });
  const [upiDetails, setUpiDetails] = useState({
    upiId: ''
  });
  const [depositHistory, setDepositHistory] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchProfileData();
    if (activeTab === 'depositHistory' || activeTab === 'withdrawalHistory') {
      fetchTransactionHistory();
    }
  }, [activeTab]);

  const fetchTransactionHistory = async () => {
    setHistoryLoading(true);
    try {
      const type = activeTab === 'depositHistory' ? 'deposit' : 'withdrawal';
      const response = await fetch(`http://localhost:5000/api/transactions?type=${type}&page=1&limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (activeTab === 'depositHistory') {
          setDepositHistory(data.transactions || []);
        } else {
          setWithdrawalHistory(data.transactions || []);
        }
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

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
      case 'success':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const fetchProfileData = async () => {
    try {
      const response = await authenticatedApi('http://localhost:5000/api/profile', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setBankDetails({
          accountNumber: data.bank_account_number || '',
          ifsc: data.bank_ifsc || '',
          holderName: data.bank_holder_name || ''
        });
        setUpiDetails({
          upiId: data.upi_id || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await authenticatedApi('http://localhost:5000/api/profile/bank', {
        method: 'PUT',
        body: JSON.stringify({
          accountNumber: bankDetails.accountNumber,
          ifsc: bankDetails.ifsc,
          holderName: bankDetails.holderName
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Bank details updated successfully!');
      } else {
        setMessage(result.error || 'Failed to update bank details');
      }
    } catch (error) {
      setMessage('Failed to update bank details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await authenticatedApi('http://localhost:5000/api/profile/upi', {
        method: 'PUT',
        body: JSON.stringify({
          upiId: upiDetails.upiId
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('UPI details updated successfully!');
      } else {
        setMessage(result.error || 'Failed to update UPI details');
      }
    } catch (error) {
      setMessage('Failed to update UPI details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Profile Settings</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'bank' ? styles.active : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            Bank Details
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'upi' ? styles.active : ''}`}
            onClick={() => setActiveTab('upi')}
          >
            UPI Details
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'depositHistory' ? styles.active : ''}`}
            onClick={() => setActiveTab('depositHistory')}
          >
            Deposit History
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'withdrawalHistory' ? styles.active : ''}`}
            onClick={() => setActiveTab('withdrawalHistory')}
          >
            Withdrawal History
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'bank' && (
            <form className={styles.form} onSubmit={handleBankSubmit}>
              <div className={styles.formGroup}>
                <label>Account Number</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  placeholder="Enter account number"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>IFSC Code</label>
                <input
                  type="text"
                  value={bankDetails.ifsc}
                  onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value})}
                  placeholder="Enter IFSC code"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Account Holder Name</label>
                <input
                  type="text"
                  value={bankDetails.holderName}
                  onChange={(e) => setBankDetails({...bankDetails, holderName: e.target.value})}
                  placeholder="Enter account holder name"
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Updating...' : 'Update Bank Details'}
              </button>
            </form>
          )}

          {activeTab === 'upi' && (
            <form className={styles.form} onSubmit={handleUpiSubmit}>
              <div className={styles.formGroup}>
                <label>UPI ID</label>
                <input
                  type="text"
                  value={upiDetails.upiId}
                  onChange={(e) => setUpiDetails({...upiDetails, upiId: e.target.value})}
                  placeholder="Enter UPI ID (e.g., user@upi)"
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Updating...' : 'Update UPI Details'}
              </button>
            </form>
          )}

          {(activeTab === 'depositHistory' || activeTab === 'withdrawalHistory') && (
            <div className={styles.historyContainer}>
              {historyLoading ? (
                <div className={styles.loading}>Loading transaction history...</div>
              ) : (activeTab === 'depositHistory' ? depositHistory : withdrawalHistory).length === 0 ? (
                <div className={styles.empty}>No {activeTab === 'depositHistory' ? 'deposit' : 'withdrawal'} transactions found</div>
              ) : (
                <div className={styles.historyTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Order ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTab === 'depositHistory' ? depositHistory : withdrawalHistory).map((transaction) => (
                        <tr key={transaction.id}>
                          <td>{formatDate(transaction.created_at)}</td>
                          <td className={styles.amount}>₹{parseFloat(transaction.amount).toFixed(2)}</td>
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
          )}

          {message && (
            <div style={{ marginTop: '20px', padding: '10px', background: message.includes('success') ? '#d4edda' : '#f8d7da', color: message.includes('success') ? '#155724' : '#721c24', borderRadius: '4px' }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
