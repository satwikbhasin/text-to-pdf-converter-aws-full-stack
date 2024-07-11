import { GENERATE_SIGNED_S3_URL_API_ENDPOINT } from "../assets/apiEndpoints";

// Function to get a signed URL for uploading to S3
const getSignedS3Url = async (uniqueId: string): Promise<string> => {
  const url = `${GENERATE_SIGNED_S3_URL_API_ENDPOINT}?s3_path=${encodeURIComponent(
    uniqueId
  )}/input.txt&fileType=text/plain`;
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
const uploadFile = async (uploadURL: string, fileBlob: Blob): Promise<void> => {
  const response = await fetch(uploadURL, {
    method: "PUT",
    body: fileBlob,
    headers: {
      "Content-Type": "text/plain",
    },
  });

  if (!response.ok) throw new Error("Failed to upload file to S3");
};

// Main function to handle the file upload process
const uploadFileToS3 = async (
  selectedFile: File | null,
  selectedFileBlob: Blob | null,
  uniqueId: string
): Promise<string | null> => {
  if (!selectedFile) return null;

  try {

    const uploadURL = await getSignedS3Url(uniqueId);
    await uploadFile(uploadURL, selectedFileBlob!);
    const s3Path = new URL(uploadURL).pathname.substring(1);
    return s3Path;
    
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return null;
  }
};

export default uploadFileToS3;
