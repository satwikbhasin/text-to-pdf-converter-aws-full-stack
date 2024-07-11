import { GENERATE_SIGNED_S3_URL_API_ENDPOINT } from "../assets/apiEndpoints";
import { saveAs } from "file-saver";
import checkPdfStatus from "./checkPdfStatus";

const getSignedS3Url = async (
  uniqueId: string,
  pdfFileName: string
): Promise<string> => {
  const url = `${GENERATE_SIGNED_S3_URL_API_ENDPOINT}?s3_path=${uniqueId}/${pdfFileName}.pdf&type=download`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch signed URL");
  }

  const { downloadURL } = await response.json();
  return downloadURL;
};

const downloadPdfFromS3 = async (uniqueId: string): Promise<String | void> => {
  const pdfStatus = await checkPdfStatus(uniqueId);
  
  if (pdfStatus.status === "pdfNotReady") {
    return "pdfNotReady";
  } else if (pdfStatus.status === "pdfNotFound") {
    return "pdfNotFound";
  } else {
    const signedDownloadUrl = await getSignedS3Url(
      uniqueId,
      pdfStatus.pdfName!
    );

    const response = await fetch(signedDownloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF for ${uniqueId}`);
    }

    const blob = await response.blob();
    const fileName = pdfStatus.pdfName + ".pdf";
    saveAs(blob, fileName);

    return "pdfDownloaded";
  }
};

export default downloadPdfFromS3;
