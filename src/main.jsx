import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/fonts.css';
import App from './App.jsx';

import Modal from "react-modal";
Modal.setAppElement("#root");   // or the actual app root id

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
