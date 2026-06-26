import React from 'react'
import ReactDOM from 'react-dom/client'
// ensure React is in scope for JSX transform
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
