import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import Footer from './Footer';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authState, authDispatch } = useAuth();
  const { walletDispatch } = useWallet();
  const { token } = authState;
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const paymentId = searchParams.get('payment_id');
    const signature = searchParams.get('signature');

    if (orderId && paymentId && signature) {
      // Verify the payment status with real Razorpay data
      const verifyPayment = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/razorpay/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: orderId,
              razorpay_payment_id: paymentId,
              razorpay_signature: signature
            })
          });

          const data = await response.json();

          if (response.ok) {
            console.log("Payment verified and wallet updated");
            // Fetch updated user data to update wallet balance in context
            try {
              const userResponse = await fetch('http://localhost:5000/api/me', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
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
            // Start countdown before redirecting
            setCountdown(3);
            const timer = setInterval(() => {
              setCountdown((prev) => {
                if (prev === 1) {
                  clearInterval(timer);
                  navigate('/dashboard');
                  return null;
                }
                return prev - 1;
              });
            }, 1000);
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
  }, [searchParams, navigate, authDispatch, walletDispatch, token]);

  return (
    <div className="payment-success">
      <h2>Payment Successful!</h2>
      <p>Your wallet has been credited with the amount.</p>
      {countdown !== null ? (
        <p>Redirecting to dashboard in {countdown}...</p>
      ) : (
        <p>Redirecting to dashboard...</p>
      )}
    </div>
  );
}

export default PaymentSuccess;
