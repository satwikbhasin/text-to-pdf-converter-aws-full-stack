import { MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT } from "../assets/apiEndpoints";

const checkPdfStatus = async (uniqueId: string): Promise<boolean> => {
  const requestUrl = `${MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT}/${uniqueId}`;

  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const { submitter } = await response.json();
  return submitter === "server";
};

const pollPdfStatus = async (uniqueId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const isGenerated = await checkPdfStatus(uniqueId);
        if (isGenerated) {
          clearInterval(interval);
          resolve(true);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 5000);
  });
};

export default pollPdfStatus;
