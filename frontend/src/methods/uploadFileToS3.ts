const getSignedS3Url = async (uniqueId: string): Promise<string> => {
  const baseUrl = process.env.REACT_APP_GENERATE_SIGNED_S3_URL_API_PROXY;
  const s3Path = encodeURIComponent(`${uniqueId}/input.txt`);
  const requesturl = `${baseUrl}?s3_path=${s3Path}&fileType=text/plain`;

  const response = await fetch(requesturl!, {
    method: "GET",
  });

  if (!response.ok) throw new Error("Failed to fetch upload URL");

  const { uploadURL } = await response.json();
  return uploadURL;
};

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
  } catch (error: any) {
    throw new Error(`Error uploading file to S3: ${error.message}`);
  }
};

export default uploadFileToS3;
