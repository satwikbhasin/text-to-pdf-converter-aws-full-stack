async function insertToDynamoDB(
  pdfName: string,
  s3Path: string,
  uniqueId: string
) {
  const requesturl =
    process.env.REACT_APP_MANAGE_USER_SUBMISSIONS_TABLE_API_PROXY;

  try {
    const response = await fetch(requesturl!, {
      method: "PUT",
      body: JSON.stringify({
        id: uniqueId,
        pdfName: pdfName,
        fileS3Path: s3Path,
        submitter: "user",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to insert to DynamoDB: ${response.statusText}`);
    }
  } catch (error : any) {
    throw new Error(`Error inserting to DynamoDB: ${error.message}`);
  }
}

export default insertToDynamoDB;
