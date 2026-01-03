import React, { createContext, useContext, useReducer } from 'react';

// Helper functions for cookie management
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function setCookie(name, value, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;SameSite=Strict`;
}

function removeCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;secure;SameSite=Strict`;
}

// Initial state
const initialState = {
  user: null,
  token: getCookie('token') || null,
  wallet_balance: 0.00,
};

// Reducer function
function userReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_TOKEN':
      setCookie('token', action.payload);
      return { ...state, token: action.payload };
    case 'SET_WALLET_BALANCE':
      return { ...state, wallet_balance: action.payload };
    case 'LOGOUT':
      removeCookie('token');
      // Clear refresh token cookie by calling logout endpoint
      fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
      }).catch(err => console.error('Logout error:', err));
      return { ...state, user: null, token: null, wallet_balance: 0.00 };
    default:
      return state;
  }
}

// Function to refresh access token
async function refreshAccessToken() {
  try {
    const response = await fetch('http://localhost:5000/api/refresh', {
      method: 'POST',
      credentials: 'include', // Include cookies
    });

    if (response.ok) {
      const data = await response.json();
      return data.accessToken;
    } else {
      throw new Error('Failed to refresh token');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

// Create context
const UserContext = createContext();

// Provider component
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  React.useEffect(() => {
    const fetchUserData = async () => {
      const token = getCookie('token');
      if (token && !state.user) {
        try {
          const response = await fetch('http://localhost:5000/api/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            dispatch({ type: 'SET_USER', payload: data.user });
            dispatch({ type: 'SET_WALLET_BALANCE', payload: data.user.wallet_balance });
          } else if (response.status === 401) {
            // Try to refresh token
            const newToken = await refreshAccessToken();
            if (newToken) {
              // Retry with new token
              const retryResponse = await fetch('http://localhost:5000/api/me', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                },
              });
              if (retryResponse.ok) {
                const data = await retryResponse.json();
                dispatch({ type: 'SET_USER', payload: data.user });
                dispatch({ type: 'SET_WALLET_BALANCE', payload: data.user.wallet_balance });
              } else {
                removeCookie('token');
                dispatch({ type: 'LOGOUT' });
              }
            }
          } else {
            // Token might be invalid, remove it
            removeCookie('token');
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // On error, remove invalid token
          removeCookie('token');
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the UserContext
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
