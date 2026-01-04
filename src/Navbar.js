import React from 'react';
import { useWallet } from './WalletContext';
import { useAuth } from './AuthContext';
import styles from './styles/navbar.module.css';

function Navbar({ onLogout, onAddMoney }) {
  const { walletState } = useWallet();
  const { authState } = useAuth();
  const { wallet_balance } = walletState;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>

        <span className={styles.walletBalance}>Wallet: ₹{wallet_balance}</span>
        <button className={styles.addMoneyBtn} onClick={onAddMoney}>💰</button>
      </div>
      <div className={styles.navbarRight}>
        {/* <span className={styles.profileSymbol}>👤</span> */}
        <button className={styles.logoutBtn} onClick={onLogout}>🚪</button>
      </div>
    </nav>
  );
}

export default Navbar;
