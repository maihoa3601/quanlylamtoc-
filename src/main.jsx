import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth'
import { DataProvider } from './hooks/useData'
import { ThemeProvider } from './hooks/useTheme'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
