import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CircleDashed } from 'lucide-react';
const UploadForm = lazy(() => import('../forms/UploadFrom'));
const DownloadForm = lazy(() => import('../forms/DownloadForm'));

const Base: React.FC = () => {
  return (
    <div className="grid place-items-center min-h-screen bg-emerald-700">
        <Suspense fallback={<div className="spinner"><CircleDashed color='white' size={30} /></div>}>
          <Routes>
            <Route path="/" element={<UploadForm />} />
            <Route path="/upload" element={<UploadForm />} />
            <Route path="/download" element={<DownloadForm />} />
          </Routes>
        </Suspense>
    </div>
  );
};

export default Base;