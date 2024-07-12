async function insertToDynamoDB(
  pdfName: string,
  s3Path: string,
  uniqueId: string
) {
  const requesturl =
    process.env.REACT_APP_MANAGE_USER_SUBMISSIONS_TABLE_API_PROXY;

  console.log("requesturl", requesturl);
  await fetch(requesturl!, {
    method: "PUT",
    body: JSON.stringify({
      id: uniqueId,
      pdfName: pdfName,
      fileS3Path: s3Path,
      submitter: "user",
    }),
  });
}

export default insertToDynamoDB;
