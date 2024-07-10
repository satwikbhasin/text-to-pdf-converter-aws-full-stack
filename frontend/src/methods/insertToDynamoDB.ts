import { MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT } from "../assets/apiEndpoints";

async function insertToDynamoDB(
  inputText: string,
  s3Url: string,
  nanoId: string
) {
  await fetch(MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: nanoId,
      text: inputText,
      fileS3Path: s3Url,
      entryType: "input",
    }),
  });
}

export default insertToDynamoDB;
