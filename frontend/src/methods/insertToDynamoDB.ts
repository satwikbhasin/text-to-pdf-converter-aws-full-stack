async function insertToDynamoDB(
  pdfName: string,
  s3Path: string,
  uniqueId: string
) {
  const requesturl =
    process.env.REACT_APP_MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const apiKey = process.env.REACT_APP_API_ACCESS_KEY;
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  await fetch(requesturl!, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      id: uniqueId,
      pdfName: pdfName,
      fileS3Path: s3Path,
      submitter: "user",
    }),
  });
}

export default insertToDynamoDB;
