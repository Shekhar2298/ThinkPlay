import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import Footer from './Footer';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authDispatch } = useAuth();
  const { walletDispatch } = useWallet();

  useEffect(() => {
    const orderId = searchParams.get('order_id');

    if (orderId) {
      // Verify the payment status
      const verifyPayment = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/razorpay/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: orderId,
              // Note: For PaymentSuccess page, we assume payment was successful
              // In a real implementation, you'd need to pass the full payment details
              razorpay_payment_id: 'verified', // Placeholder
              razorpay_signature: 'verified'   // Placeholder
            })
          });

          const data = await response.json();

          if (response.ok) {
            console.log("Payment verified and wallet updated");
            // Fetch updated user data to update wallet balance in context
            const token = localStorage.getItem('token');
            if (token) {
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
                  authDispatch({ type: 'SET_USER', payload: userData.user });
                  walletDispatch({ type: 'SET_WALLET_BALANCE', payload: userData.user.wallet_balance });
                }
              } catch (error) {
                console.error('Error fetching updated user data:', error);
              }
              navigate('/dashboard');
            }
          } else {
            console.error("Payment verification failed:", data.error);
            // Handle verification failure - perhaps show error message
            navigate('/dashboard');
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          navigate('/dashboard');
        }
      };

      verifyPayment();
    } else {
      navigate('/dashboard');
    }
  }, [searchParams, navigate, authDispatch, walletDispatch]);

  return (
    <div className="payment-success">
      <h2>Payment Successful!</h2>
      <p>Your wallet has been credited with the amount.</p>
      <p>Redirecting to dashboard...</p>
    </div>
  );
}

export default PaymentSuccess;
