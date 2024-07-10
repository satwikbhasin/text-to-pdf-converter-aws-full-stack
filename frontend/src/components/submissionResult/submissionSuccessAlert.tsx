import React from 'react';
import { AlertCircle, Download } from 'lucide-react';
// import downloadPDFFromS3 from '../../methods/downloadPDFfromS3';

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
            </div>
            {/* <button className="mt-4 bg-green-800 text-white rounded-lg p-2 hover:bg-green-600 flex items-center" onClick={downloadPDFFromS3}>
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                Download
            </button> */}
        </div>
    );
};

export default SubmissionSuccessAlert;