import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import errors from '../../assets/errors';

interface ProcessErrorProps {
    type: string;
}

const ProcessError: React.FC<ProcessErrorProps> = ({ type }) => {
    return (
        <div id="alert-3" className="flex items-center p-4 text-red-800 mt-3 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <AlertCircle className="flex-shrink-0 w-4 h-4" aria-hidden="true" />
            <span className="sr-only">Info</span>
            <div className="ms-2 text-sm font-medium">
                {type === 'upload' ? errors.process.upload.uploadFailure : ""}
                {type === 'download' ? errors.process.download.downloadFailure : ""}
            </div>
            <button
                type="button"
                className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                aria-label="Close"
                onClick={() => window.location.reload()}
            >
                <span className="sr-only">Close</span>
                <X className="w-3 h-3" aria-hidden="true" />
            </button>
        </div>
    );
};

export default ProcessError;