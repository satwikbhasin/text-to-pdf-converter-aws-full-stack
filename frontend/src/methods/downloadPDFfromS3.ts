import { GENERATE_SIGNED_S3_URL_API_ENDPOINT } from "../assets/apiEndpoints";
import Cookies from "js-cookie";
import { saveAs } from "file-saver";
import checkPdfStatus from "./checkPdfStatus";

const getSignedS3Url = async (): Promise<string> => {
  const url = `${GENERATE_SIGNED_S3_URL_API_ENDPOINT}?s3_path=${Cookies.get(
    "uniqueIdForTextToPDF"
  )}/${Cookies.get("pdfNameForTextToPDF")}.pdf&type=download`;

  console.log("URL:", url);

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

const downloadPdfFromS3 = async (): Promise<void> => {
  const signedDownloadUrl = await getSignedS3Url();

  await checkPdfStatus(Cookies.get("uniqueIdForTextToPDF") || "");

  const response = await fetch(signedDownloadUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download ${Cookies.get("pdfNameForTextToPDF")}.pdf`
    );
  }

  const blob = await response.blob();
  const fileName = Cookies.get("pdfNameForTextToPDF") + ".pdf";
  saveAs(blob, fileName);
};

export default downloadPdfFromS3;
