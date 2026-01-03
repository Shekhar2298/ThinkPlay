import React from 'react';
import styles from './styles/navbar.module.css';
import { useUser } from './UserContext';

function Navbar({ walletBalance, mobile, onLogout, onAddMoney }) {

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
       
        <span className={styles.walletBalance}>Wallet: ₹{walletBalance}</span>
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
