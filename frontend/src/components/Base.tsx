import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "../styles/base.css";

const UploadForm = lazy(() => import('./UploadFrom'));
const DownloadForm = lazy(() => import('./DownloadForm'));

const Base: React.FC = () => {
  return (
    <div className="grid place-items-center min-h-screen bg-emerald-700">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <Suspense fallback={<div className="spinner"></div>}>
          <Routes>
            <Route path="/" element={<UploadForm />} />
            <Route path="/upload" element={<UploadForm />} />
            <Route path="/download" element={<DownloadForm />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default Base;