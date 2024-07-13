import React, { useState } from 'react';
import { Download, CheckCircle, ClipboardPaste, CircleDashed, RefreshCwIcon } from 'lucide-react';
import errors from '../../assets/errors';
import downloadPdfFromS3 from '../../methods/downloadPdfFromS3';
import ProcessError from '../common/ProcessError';


const DownloadForm: React.FC = () => {
    const [uniqueId, setUniqueId] = useState<string>('');
    const [uniqueIdError, setUniqueIdError] = useState<string>('');
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [downloaded, setDownloaded] = useState<boolean>(false);
    const [downloadError, setDownloadError] = useState<boolean>(false);


    const validateForm = (): boolean => {
        let isValid = true;
        const nanoidRegex = /^[\w-]{21}$/;

        if (uniqueId === '') {
            setUniqueIdError(errors.validation.downloadForm.uniqueIdRequired);
            isValid = false;
        } else if (!nanoidRegex.test(uniqueId)) {
            setUniqueIdError(errors.validation.downloadForm.invalidUniqueId);
            isValid = false;
        }

        return isValid;
    };

    const handleFileDownload = async (): Promise<boolean> => {
        try {
            const response = await downloadPdfFromS3(uniqueId);
            if (response === "pdfNotReady") {
                setIsDownloading(false);
                setUniqueIdError(errors.process.download.pdfNotReady);
            } else if (response === "pdfNotFound") {
                setIsDownloading(false);
                setUniqueIdError(errors.process.download.nonExistentUniqueId);
            } else if (response === "pdfDownloaded") {
                setUniqueIdError('');
                setDownloaded(true);
            }
            return true;
        }
        catch (error) {
            console.error('Error downloading:', error);
            return false;
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsDownloading(true);

        if (!validateForm()) {
            setIsDownloading(false);
            return;
        }

        const processValid = await handleFileDownload();

        if (!processValid) {
            setIsDownloading(false);
            setDownloadError(true);
        }

        setIsDownloading(false);
        return;
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUniqueId(e.target.value);
        if (uniqueIdError) setUniqueIdError('');
        setDownloadError(false);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setUniqueId(text);
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
        }
    };

    const handleReset = () => {
        setUniqueId('');
        setUniqueIdError('');
        setIsDownloading(false);
        setDownloaded(false);
        setDownloadError(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="font-bold mb-6 text-gray-900 text-center">Enter your Unique Submission ID</h1>
            <form className="grid gap-3" onSubmit={handleSubmit}>
                <div className="grid">
                    <div className='flex flex-row justify-center items-center'>
                        <button
                            type="button"
                            onClick={handlePaste}
                            className={`mr-2 text-gray-500 ${!(isDownloading || downloaded) && 'hover:text-gray-700'}`}
                            disabled={isDownloading || downloaded}
                        >
                            <ClipboardPaste />
                        </button>
                        <input
                            type="text"
                            id="inputText"
                            value={uniqueId}
                            onChange={handleInputChange}
                            disabled={isDownloading || downloaded}
                            className={`text-sm w-full border border-indigo-300 rounded-lg shadow-sm focus:ring focus:ring-indigo-500 focus:border-indigo-500 ${isDownloading || downloaded ? 'bg-gray-200 cursor-not-allowed' : ''
                                }`}
                            placeholder="Enter text"
                        />
                    </div>
                    <div className="h-4 flex justify-center items-center mt-1">
                        {uniqueIdError && <p className="text-red-500 text-xs">{uniqueIdError}</p>}
                    </div>
                </div>
                <div className="grid gap-2 justify-center">
                    {isDownloading ? (
                        <div className="flex justify-center items-center">
                            <CircleDashed className="animate-spin h-7 w-7 text-emerald-500" />
                        </div>
                    ) : (
                        <button
                            type="submit"
                            disabled={downloaded}
                            className={`${downloaded
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:bg-gradient-to-br'
                                } focus:ring-4 focus:ring-emerald-300 text-white font-medium rounded-lg px-5 py-2.5 text-sm flex items-center justify-center`}
                        >
                            {downloaded ? (
                                <>
                                    <CheckCircle className="h-4 mr-1" />
                                    Downloaded
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 mr-1" />
                                    Download
                                </>
                            )}
                        </button>
                    )}
                </div>
            </form>
            <div className='flex items-center justify-center'>
                {downloaded && (
                    <button onClick={handleReset} className="ml-2 flex items-center justify-center p-2 rounded-full">
                        Reset<RefreshCwIcon className="h-4 text-gray-900 spin-on-hover" />
                    </button>
                )}
                {downloadError && <ProcessError type="download" />}
            </div>
        </div>
    );
}

export default DownloadForm;