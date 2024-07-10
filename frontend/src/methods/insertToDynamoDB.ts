import { MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT } from "../assets/apiEndpoints";

async function insertToDynamoDB(
  pdfName: string,
  s3Path: string,
  uniqueId: string
) {
  await fetch(MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: uniqueId,
      pdfName: pdfName,
      fileS3Path: s3Path,
      submitter: "user",
    }),
  });
}

export default insertToDynamoDB;
