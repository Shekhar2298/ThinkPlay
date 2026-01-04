# State Management Implementation TODO

## Tasks
- [ ] Create WalletContext.js with wallet_balance state, reducer, and provider (similar to AuthContext).
- [ ] Update UserContext.js to wrap AuthProvider and WalletProvider instead of managing combined state.
- [ ] Update App.js Dashboard component to use useAuth and useWallet hooks.
- [ ] Update Login.js to use useAuth and useWallet for dispatching SET_USER/SET_TOKEN and SET_WALLET_BALANCE.
- [ ] Update Signup.js similarly to Login.js.
- [ ] Update AddMoney.js to use useAuth (for user) and useWallet (for balance and dispatch).
- [ ] Update PaymentSuccess.js to use useAuth and useWallet for dispatching updates.
- [ ] Update Navbar.js to use useAuth (for user) and useWallet (for balance), remove useUser import.
- [ ] Remove walletBalance prop from Navbar in App.js since Navbar will manage its own state.
- [ ] Test login, signup, payment flows, and quiz functionality.
- [ ] Verify re-render optimization (components only re-render when their specific context changes).
- [ ] Update TODO_STATE_MANAGEMENT.md to mark tasks as completed.
