import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT } from '../assets/apiEndpoints';

import validationErrors from './messages/validationErrors';
import uploadFileToS3 from '../methods/uploadFileToS3';

interface FormProps {
    onSubmissionSuccess: () => void;
    onUploadFailure: () => void;
}

const Form: React.FC<FormProps> = ({ onUploadFailure, onSubmissionSuccess }) => {
    const [inputText, setInputText] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFileType, setSelectedFileType] = useState<string>('');
    const [selectedFileBlob, setSelectedFileBlob] = useState<Blob | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inputTextError, setInputTextError] = useState<string>('');
    const [selectedFileError, setSelectedFileError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        let isValid = true;
        if (!inputText) {
            setInputTextError(validationErrors.inputTextRequired);
            isValid = false;
        } else {
            setInputTextError('');
        }
        if (!selectedFile) {
            setSelectedFileError(validationErrors.fileSelectionRequired);
            isValid = false;
        } else {
            setSelectedFileError('');
        }

        if (!isValid) return;

        const nanoId = nanoid();

        let fileUploadSuccess = true;
        try {
            const s3Url = await uploadFileToS3(selectedFile, selectedFileBlob, selectedFileType, nanoId);

            await fetch(MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: nanoId,
                    text: inputText,
                    fileS3Path: s3Url,
                    entryType: "input",
                }),
            });

        } catch (error) {
            fileUploadSuccess = false;
            console.error('Error uploading file:', error);
        }

        if (!fileUploadSuccess) {
            onUploadFailure();
            return;
        }
        setIsSubmitting(false);

        onSubmissionSuccess();
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        if (inputTextError) setInputTextError('');
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setSelectedFileType(e.target.files[0].type);
            setSelectedFileBlob(new Blob([e.target.files[0]]));
            setSelectedFileError('');
        }
    };

    return (
        <div>
            <h1 className="text-lg sm:text-lg md:text-lg lg:text-2xl xl:text-2xl 2xl:text-2xl font-bold mb-6 text-gray-900 text-center">Upload & Submit</h1>
            <form className="grid gap-6" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                    <label htmlFor="inputText" className="text-sm font-medium text-gray-700">
                        Text Input
                    </label>
                    <input
                        type="text"
                        id="inputText"
                        value={inputText}
                        onChange={handleInputChange}
                        className="block w-full border border-indigo-300 rounded-md shadow-sm focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter text"
                    />
                    {inputTextError && <p className="text-red-500 text-xs">{inputTextError}</p>}
                </div>
                <div className="grid gap-2">
                    <label htmlFor="fileInput" className="text-sm font-medium text-gray-700">
                        File Input
                    </label>
                    <input
                        type="file"
                        id="fileInput"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-900 border border-indigo-300 rounded-md cursor-pointer focus:outline-none"
                    />
                    {selectedFileError && <p className="text-red-500 text-xs">{selectedFileError}</p>}
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