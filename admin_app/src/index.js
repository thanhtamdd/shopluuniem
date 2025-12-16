import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

import App from './App';
import reportWebVitals from './reportWebVitals';

// 🔹 fix process is not defined
import process from 'process';
window.process = process;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
