import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '12px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#0d9488', secondary: '#ffffff' },
                style: { background: '#f0fdfa', color: '#115e59', border: '1px solid #ccfbf1' },
              },
              error: {
                iconTheme: { primary: '#e11d48', secondary: '#ffffff' },
                style: { background: '#fff1f2', color: '#9f1239', border: '1px solid #ffe4e6' },
              },
            }}
          />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
