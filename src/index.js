import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AdminAuthProvider,  } from "./context/admincontext.js";
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<>
<AdminAuthProvider>
  <App />
</AdminAuthProvider>
</>
);

reportWebVitals();
