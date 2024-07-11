import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { Clipboard, ClipboardCheck, CheckCircle, Upload, CircleDashed } from 'lucide-react';
import errors from '../assets/errors';
import uploadFileToS3 from '../methods/uploadFileToS3';
import insertToDynamoDB from '../methods/insertToDynamoDB';
import ProcessError from './submissionResult/ProcessError';

const UploadForm: React.FC = () => {
    const [pdfName, setPdfName] = useState<string>('');
    const [textFile, setTextFile] = useState<File | null>(null);
    const [selectedFileBlob, setSelectedFileBlob] = useState<Blob | null>(null);
    const [uniqueId, setUniqueId] = useState<string>('');
    const [copied, setCopied] = useState<boolean>(false);


    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [pdfNameError, setPdfNameError] = useState<string>('');
    const [textFileError, setTextFileError] = useState<string>('');
    const [uploadError, setUploadError] =useState<boolean>(false);

    const validateForm = (): boolean => {
        let isValid = true;
        if (!pdfName) {
            setPdfNameError(errors.validation.uploadForm.inputTextRequired);
            isValid = false;
        } else {
            setPdfNameError('');
        }
        if (!textFile) {
            setTextFileError(errors.validation.uploadForm.textFileRequired);
            isValid = false;
        } else {
            setTextFileError('');
        }
        if (textFile && textFile.type !== 'text/plain') {
            setTextFileError(errors.validation.uploadForm.textFileInvalid);
            isValid = false;
        }
        return isValid;
    };

    const handleFileUpload = async (): Promise<boolean> => {
        try {
            const uniqueId = nanoid();
            setUniqueId(uniqueId);
            const s3Path = await uploadFileToS3(textFile!, selectedFileBlob!, uniqueId);
            await insertToDynamoDB(pdfName, s3Path!, uniqueId);
            return true;
        } catch (error) {
            console.error('Error Submitting:', error);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        const fileUploadSuccess = await handleFileUpload();

        if (!fileUploadSuccess) {
            setIsSubmitting(false);
            setUploadError(true);
            return;
        }

        setIsSubmitting(false);
        setSubmissionSuccess(true);
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPdfName(e.target.value);
        if (pdfNameError) setPdfNameError('');
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setTextFile(file);
            setSelectedFileBlob(new Blob([e.target.files[0]]));
        }
    };

    const copyToClipboard = () => {
        if (uniqueId) {
            navigator.clipboard.writeText(uniqueId).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 5000);
            }, (err) => {
                console.error('Could not copy text: ', err);
            });
        }
    };

    return (
        <div>
            <h1 className="font-bold mb-6 text-gray-900 text-center">Specify the desired PDF name & Upload your text file</h1>
            <form className="grid gap-3" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                    <label htmlFor="pdfName" className="font-medium text-gray-700 text-md">
                        PDF Name
                    </label>
                    <input
                        type="text"
                        id="inputText"
                        value={pdfName}
                        disabled={isSubmitting || submissionSuccess}
                        onChange={handleInputChange}
                        className={`text-sm w-full border border-indigo-300 rounded-lg shadow-sm focus:ring focus:ring-indigo-500 focus:border-indigo-500 ${isSubmitting || submissionSuccess ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                        placeholder="Enter text"
                    />
                    <div className="h-4">
                        {pdfNameError && <p className="text-red-500 text-xs">{pdfNameError}</p>}
                    </div>
                </div>
                <div className="grid gap-2">
                    <label htmlFor="fileInput" className="font-medium text-gray-700 text-md">
                        Text File
                    </label>
                    <input
                        type="file"
                        id="fileInput"
                        disabled={isSubmitting || submissionSuccess}
                        onChange={handleFileChange}
                        className={`overflow-hidden text-sm w-full border border-indigo-300 rounded-lg shadow-sm focus:ring focus:ring-indigo-500 focus:border-indigo-500 ${isSubmitting || submissionSuccess ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    />
                    <div className="h-4">
                        {textFileError && <p className="text-red-500 text-xs">{textFileError}</p>}
                    </div>
                </div>
                <div className="grid gap-2 justify-center">
                    {isSubmitting ? (
                        <div className="flex justify-center items-center">
                            <CircleDashed className="animate-spin h-7 w-7 text-emerald-500" />
                        </div>
                    ) : (
                        <button
                            type="submit"
                            disabled={isSubmitting || submissionSuccess}
                            className={`${submissionSuccess
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:bg-gradient-to-br'
                                } focus:ring-4 focus:ring-emerald-300 text-white font-medium rounded-lg px-5 py-2.5 text-sm flex items-center justify-center`}                        >
                            {submissionSuccess ? (
                                <>
                                    <CheckCircle className="h-4 mr-1" />
                                    Submitted
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 mr-1" />
                                    Submit
                                </>
                            )}
                        </button>
                    )}
                </div>
                <div>
                    {submissionSuccess ? (
                        <div className="border border-indigo-500 flex justify-center items-center mt-2 grid gap-2 p-2 rounded-lg justify-center bg-gray-200 text-sm text-gray-900">
                            <span className="flex font-bold items-center justify-center">Unique Submission ID</span>
                            <span className="flex items-center justify-center">{uniqueId}
                                <button onClick={copyToClipboard} className="" type='button'>
                                    {copied ? <ClipboardCheck className="h-4 text-emerald-500" /> : <Clipboard className="h-4 text-emerald-500" />}
                                </button>
                            </span>
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>
            </form>
            {uploadError && <ProcessError type="upload" />}
        </div>
    );
}

export default UploadForm;