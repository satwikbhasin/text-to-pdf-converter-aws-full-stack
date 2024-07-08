import { GENERATE_SIGNED_URL_API } from "../assets/apiEndpoints";
const API_ENDPOINT = GENERATE_SIGNED_URL_API + "/uploads";

const uploadFileToS3 = async (
  selectedFile: File | null,
  selectedFileBlob: Blob | null,
  selectedFileType: string,
  nanoId: string
): Promise<string | null> => {
  try {
    if (selectedFile) {
      const getS3SignedUrl = `${API_ENDPOINT}?fileName=${encodeURIComponent(
        "input_" + nanoId + "~" + selectedFile.name
      )}&fileType=${selectedFileType}`;

      const response = await fetch(getS3SignedUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch upload URL");
      }

      const data = await response.json();
      const uploadUrl = data.uploadURL;

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: selectedFileBlob,
        headers: {
          "Content-Type": selectedFileType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      const urlParts = new URL(uploadUrl);
      // URL format is https://backendstack-bucketName.s3.amazonaws.com/...
      // Bucket name = first removing 'backendstack-' prefix and then splitting by '.s3.amazonaws.com'
      const bucketName = urlParts.hostname
        .replace("backendstack-", "")
        .split(".s3.amazonaws.com")[0];

      const s3ObjectKey = uploadUrl.split("?")[0].split("/").pop();
      const s3Path = `${bucketName}/${s3ObjectKey}`;

      return s3Path;
    }
    return null;
  } catch (error) {
    throw new Error("Error uploading file to S3");
  }
};

export default uploadFileToS3;
