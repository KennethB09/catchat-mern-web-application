import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { AuthContextProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthContextProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_APP_OAUTH_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </AuthContextProvider>
  </React.StrictMode>,
)
