import React from 'react';

function Navbar({ walletBalance, onLogout, onAddMoney }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="wallet-balance">Wallet: ₹{walletBalance}</span>
        <button className="add-money-btn" onClick={onAddMoney}>Add Money</button>
      </div>
      <div className="navbar-right">
        <span className="profile-symbol">👤</span>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
