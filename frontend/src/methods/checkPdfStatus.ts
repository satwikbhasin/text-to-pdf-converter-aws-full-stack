interface PdfStatus {
  status: string;
  pdfName?: string;
}

const checkPdfStatus = async (uniqueId: string): Promise<PdfStatus> => {
  const requestUrl = `${process.env.REACT_APP_MANAGE_USER_SUBMISSIONS_TABLE_API_PROXY}/${uniqueId}`;

  try {
    const response = await fetch(requestUrl!, {
      method: "GET",
    });

    if (response.status === 404) {
      return { status: "pdfNotFound" };
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF status: ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    const { submitter, pdfName } = jsonResponse;

    return {
      status: submitter === "server" ? "pdfReady" : "pdfNotReady",
      pdfName,
    };
  } catch (error : any) {
    throw new Error(`Error checking PDF status: ${error.message}`);
  }
};

export default checkPdfStatus;
