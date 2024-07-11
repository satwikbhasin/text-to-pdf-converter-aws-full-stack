import { MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT } from "../assets/apiEndpoints";

interface PdfStatus {
  status: string;
  pdfName?: string;
}

const checkPdfStatus = async (uniqueId: string): Promise<PdfStatus> => {
  const requestUrl = `${MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT}/${uniqueId}`;
  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    return { status: "pdfNotFound" };
  }
  const jsonResponse = await response.json();

  const { submitter, pdfName } = jsonResponse;
  return {
    status: submitter === "server" ? "pdfReady" : "pdfNotReady",
    pdfName,
  };
};

export default checkPdfStatus;
