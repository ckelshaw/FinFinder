import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
//import reportWebVitals from './reportWebVitals';
//import bootstrap from 'bootstrap/dist/css/bootstrap.min.css';
import 'bootswatch/dist/darkly/bootstrap.min.css';

import { ClerkProvider } from '@clerk/clerk-react';

// Importing Publishable Key for Clerk
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  console.error('Clerk Publishable Key is not defined. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file.');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
