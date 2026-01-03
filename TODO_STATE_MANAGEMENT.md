# State Management Optimization TODO

## Overview
Split UserContext into smaller contexts to prevent unnecessary re-renders and move component-specific state to local state.

## Tasks
- [ ] Create AuthContext.js for authentication state (user, token)
- [ ] Create WalletContext.js for wallet balance
- [ ] Update UserContext.js to provide both contexts
- [ ] Update App.js to use appropriate contexts
- [ ] Update Login.js to use AuthContext
- [ ] Update Signup.js to use AuthContext
- [ ] Update MathQuiz.js to use AuthContext and WalletContext
- [ ] Update AddMoney.js to use AuthContext and WalletContext
- [ ] Update PaymentSuccess.js to use AuthContext and WalletContext
- [ ] Remove unused useUser import from Navbar.js
- [ ] Test re-render optimization
- [ ] Verify all functionality works (login, signup, payments, quiz)
