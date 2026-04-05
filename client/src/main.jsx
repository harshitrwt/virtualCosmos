import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // Remove StrictMode to avoid PixiJS double initialization issues 
  // and multiple socket connections while developing, if they had race conditions before.
  // We'll leave it as requested, but if it causes double loading we'll leave it out. The previous conversation mentioned fixing initialization race conditions in PixiJS. StrictMode is notorious for that. I'll just wrap it in BrowserRouter.
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
