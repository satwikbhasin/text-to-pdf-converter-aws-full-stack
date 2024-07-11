import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import "../../styles/success.css";

const SubmissionSuccessAlert = () => {
    return (
        <div id="alert-3" className="flex flex-col items-center p-10 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
            <div className="flex items-center justify-center w-full">
                <div className="flex items-center">
                    <AlertCircle className="flex-shrink-0 w-4 h-4" aria-hidden="true" />
                    <div className="ml-2 text-sm font-medium">
                        Conversion Successful
                    </div>
                </div>
                <button onClick={() => window.location.reload()} className="rotate-on-hover flex items-center px-4 py-2 text-sm font-medium border border-transparent rounded-md">
                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};

export default SubmissionSuccessAlert;