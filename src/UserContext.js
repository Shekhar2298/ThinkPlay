import React from 'react';
import { AuthProvider } from './AuthContext';
import { WalletProvider } from './WalletContext';

// Provider component that wraps AuthProvider and WalletProvider
export function UserProvider({ children }) {
  return (
    <AuthProvider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </AuthProvider>
  );
}
