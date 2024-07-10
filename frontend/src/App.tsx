import React, { useState } from 'react';
import Form from './components/Form'
import SubmissionSuccessAlert from './components/submissionResult/submissionSuccessAlert';
import FileUploadError from './components/submissionResult/fileUploadError';

const App: React.FC = () => {
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [uploadFailure, setUploadFailure] = useState(false);

  const handleSubmissionSuccess = () => {
    setSubmissionSuccess(true);
    setUploadFailure(false);
  };

  const handleUploadFailure = () => {
    setUploadFailure(true);
    setSubmissionSuccess(false);
  };

  return (
    <div className="grid place-items-center min-h-screen bg-emerald-700 p-5">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {submissionSuccess ? (
          <SubmissionSuccessAlert />
        ) : uploadFailure ? (
          <FileUploadError />
        ) : (
          <Form onSubmissionFailure={handleUploadFailure} onSubmissionSuccess={handleSubmissionSuccess} />
        )}
      </div>
    </div>
  );
};

export default App;