import { GENERATE_SIGNED_S3_URL_API_ENDPOINT } from "../assets/apiEndpoints";

// Function to get a signed URL for uploading to S3
const getSignedS3Url = async (fileName: string, fileType: string): Promise<string> => {
  const url = `${GENERATE_SIGNED_S3_URL_API_ENDPOINT}?fileName=${encodeURIComponent(fileName)}&fileType=${fileType}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch upload URL");

  const { uploadURL } = await response.json();
  return uploadURL;
};

// Function to upload a file to S3 using the signed URL
const uploadFile = async (uploadURL: string, fileBlob: Blob, fileType: string): Promise<void> => {
  const response = await fetch(uploadURL, {
    method: "PUT",
    body: fileBlob,
    headers: {
      "Content-Type": fileType,
    },
  });

  if (!response.ok) throw new Error("Failed to upload file to S3");
};

// Main function to handle the file upload process
const uploadFileToS3 = async (
  selectedFile: File | null,
  selectedFileBlob: Blob | null,
  selectedFileType: string,
  nanoId: string
): Promise<string | null> => {
  if (!selectedFile) return null;

  try {
    const fileName = `input_${nanoId}~${selectedFile.name}`;
    const uploadURL = await getSignedS3Url(fileName, selectedFileType);
    await uploadFile(uploadURL, selectedFileBlob!, selectedFileType);

    const s3Path = new URL(uploadURL).pathname.substring(1);
    return s3Path;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return null;
  }
};

export default uploadFileToS3;