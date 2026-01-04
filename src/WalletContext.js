import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Initial state for wallet
const initialWalletState = {
  wallet_balance: 0.00,
};

// Reducer function for wallet
function walletReducer(state, action) {
  switch (action.type) {
    case 'SET_WALLET_BALANCE':
      return { ...state, wallet_balance: action.payload };
    default:
      return state;
  }
}

// Create context
const WalletContext = createContext();

// Provider component
export function WalletProvider({ children }) {
  const [state, dispatch] = useReducer(walletReducer, initialWalletState);
  const { authState } = useAuth();

  useEffect(() => {
    if (authState.user) {
      dispatch({ type: 'SET_WALLET_BALANCE', payload: authState.user.wallet_balance });
    }
  }, [authState.user]);

  return (
    <WalletContext.Provider value={{ walletState: state, walletDispatch: dispatch }}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook to use the WalletContext
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
