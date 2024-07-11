import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Base from './components/main/Base';
import Navbar from './components/main/Navbar';
import './styles/globals.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <div className='h-screen overflow-hidden'>
      <Router>
        <Navbar />
        <Base />
      </Router>
    </div>
  </React.StrictMode>
);
