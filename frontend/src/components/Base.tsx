import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SubmissionSuccessAlert from './submissionResult/SuccessAlert';
import FileUploadError from './submissionResult/FileUploadError';
import "../styles/base.css";

const UploadForm = lazy(() => import('./UploadFrom'));
const DownloadForm = lazy(() => import('./DownloadForm'));

const Base: React.FC = () => {
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [uploadFailure, setUploadFailure] = useState(false);

  const handleSuccess = () => {
    setSubmissionSuccess(true);
    setUploadFailure(false);
  };

  const handleFailure = () => {
    setUploadFailure(true);
    setSubmissionSuccess(false);
  };

  return (
    <div className="grid place-items-center min-h-screen bg-emerald-700">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <Suspense fallback={<div className="spinner"></div>}>
          <Routes>
            <Route path="/" element={<UploadForm onFailure={handleFailure} onSuccess={handleSuccess} />} />
            <Route path="/upload" element={<UploadForm onFailure={handleFailure} onSuccess={handleSuccess} />} />
            <Route path="/download" element={<DownloadForm onFailure={handleFailure} onSuccess={handleSuccess} />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default Base;