interface PdfStatus {
  status: string;
  pdfName?: string;
}

const checkPdfStatus = async (uniqueId: string): Promise<PdfStatus> => {
  const requestUrl = `${process.env.REACT_APP_MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT}/${uniqueId}`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const apiKey = process.env.REACT_APP_API_ACCESS_KEY;
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  const response = await fetch(requestUrl!, {
    method: "GET",
    headers,
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
