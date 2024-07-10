import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import Cookies from 'js-cookie';

import validationErrors from '../assets/validationErrors';
import uploadFileToS3 from '../methods/uploadFileToS3';
import insertToDynamoDB from '../methods/insertToDynamoDB';
import downloadPDFFromS3 from '../methods/downloadPDFfromS3';

interface FormProps {
    onSubmissionSuccess: () => void;
    onSubmissionFailure: () => void;
}

const Form: React.FC<FormProps> = ({ onSubmissionFailure, onSubmissionSuccess }) => {
    const [pdfName, setPdfName] = useState<string>('');
    const [textFile, setTextFile] = useState<File | null>(null);
    const [selectedFileBlob, setSelectedFileBlob] = useState<Blob | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pdfNameError, setPdfNameError] = useState<string>('');
    const [textFileError, setTextFileError] = useState<string>('');

    const validateForm = (): boolean => {
        let isValid = true;
        if (!pdfName) {
            setPdfNameError(validationErrors.inputTextRequired);
            isValid = false;
        } else {
            setPdfNameError('');
        }
        if (!textFile) {
            setTextFileError(validationErrors.textFileRequired);
            isValid = false;
        } else {
            setTextFileError('');
        }
        console.log(textFile?.type);
        if (textFile && textFile.type !== 'text/plain') {
            setTextFileError(validationErrors.textFileInvalid);
            isValid = false;
        }
        return isValid;
    };

    const handleFileUpload = async (): Promise<boolean> => {
        try {
            const uniqueId = nanoid();
            Cookies.set('uniqueIdForTextToPDF', uniqueId);
            Cookies.set('pdfNameForTextToPDF', pdfName);
            const s3Path = await uploadFileToS3(textFile!, selectedFileBlob!, uniqueId);
            await insertToDynamoDB(pdfName, s3Path!, uniqueId);
            await downloadPDFFromS3();
            return true;
        } catch (error) {
            console.error('Error uploading file:', error);
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
            onSubmissionFailure();
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(false);
        onSubmissionSuccess();
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

    return (
        <div>
            <h1 className="font-bold mb-6 text-gray-900 text-center text-xl">Text to PDF Converter</h1>
            <form className="grid gap-3" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                    <label htmlFor="inputText" className="font-medium text-gray-700 text-md">
                        PDF Name
                    </label>
                    <input
                        type="text"
                        id="inputText"
                        value={pdfName}
                        onChange={handleInputChange}
                        className="block w-full border border-indigo-300 rounded-lg shadow-sm focus:ring focus:ring-indigo-500 focus:border-indigo-500"
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
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-900 border border-indigo-300 rounded-lg cursor-pointer focus:outline-none max-w-full overflow-hidden"
                    />
                    <div className="h-4">
                        {textFileError && <p className="text-red-500 text-xs">{textFileError}</p>}
                    </div>
                </div>
                <div className="grid gap-2 justify-center">
                    {isSubmitting ? (
                        <div className="flex justify-center items-center">
                            <svg className="animate-spin h-7 w-7 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:bg-gradient-to-br focus:ring-4 focus:ring-emerald-300 text-white font-medium rounded-lg px-5 py-2.5 text-sm"
                        >
                            Submit
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default Form;