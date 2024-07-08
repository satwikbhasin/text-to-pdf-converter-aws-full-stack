import React, { useState } from 'react';
import Form from './components/Form'
import SubmissionSuccessAlert from './components/messages/submissionSuccessAlert';
import FileUploadError from './components/messages/fileUploadError';

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
    <div className="min-h-screen flex items-center justify-center bg-emerald-700">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 sm:w-1/3 md:w-1/3 lg:w-1/3 xl:w-1/3 2xl:w-1/3 mx-auto">
        {submissionSuccess ? (
          <SubmissionSuccessAlert />
        ) : uploadFailure ? (
          <FileUploadError />
        ) : (
          <Form onUploadFailure={handleUploadFailure} onSubmissionSuccess={handleSubmissionSuccess} />
        )}
      </div>
    </div>
  );
};

export default App;