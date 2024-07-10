import uploadFileToS3 from "./uploadFileToS3";
import insertToDynamoDB from "./insertToDynamoDB";

export const handleFileUpload = async (
  selectedFile: File,
  selectedFileBlob: Blob,
  selectedFileType: string,
  nanoId: string,
  inputText: string
): Promise<boolean> => {
  try {
    const s3Url = await uploadFileToS3(
      selectedFile,
      selectedFileBlob,
      selectedFileType,
      nanoId
    );
    await insertToDynamoDB(inputText, s3Url!, nanoId);
    return true;
  } catch (error) {
    console.error("Error uploading file:", error);
    return false;
  }
};

export const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setInputText: React.Dispatch<React.SetStateAction<string>>,
  setInputTextError: React.Dispatch<React.SetStateAction<string>>,
  inputTextError: string
) => {
  setInputText(e.target.value);
  if (inputTextError) setInputTextError("");
};

export const handleFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>,
  setSelectedFileType: React.Dispatch<React.SetStateAction<string>>,
  setSelectedFileBlob: React.Dispatch<React.SetStateAction<Blob>>,
  setSelectedFileError: React.Dispatch<React.SetStateAction<string>>
) => {
  if (e.target.files && e.target.files.length > 0) {
    setSelectedFile(e.target.files[0]);
    setSelectedFileType(e.target.files[0].type);
    setSelectedFileBlob(new Blob([e.target.files[0]]));
    setSelectedFileError("");
  }
};
