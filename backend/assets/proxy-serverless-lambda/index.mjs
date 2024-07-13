import axios from 'axios';

const generateSignedS3UrlApiEndpoint = process.env.GENERATE_SIGNED_S3_URL_API_ENDPOINT;
const manageUserSubmissionsTableApiEndpoint = process.env.MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT;
const generateSignedS3UrlApiHost = process.env.GENERATE_SIGNED_S3_URL_API_HOST;
const manageUserSubmissionsTableApiHost = process.env.MANAGE_USER_SUBMISSIONS_TABLE_API_HOST;
const apiKey = process.env.API_KEY;

export const handler = async (event) => {
  // Log the entire event object for debugging
  console.log('Event received:', JSON.stringify(event));
      
  // Check if path matches to handle specific endpoint logic
  if (event && event.path.startsWith('/generateSignedS3Url')){
    const url = `${generateSignedS3UrlApiEndpoint}?${new URLSearchParams(event.queryStringParameters).toString()}`;

    const options = {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        'x-api-key': apiKey,
        'Host': generateSignedS3UrlApiHost,
      },
    };

    try {
      const response = await axios(url, options);

      return {
        statusCode: response.status,
        body: JSON.stringify(response.data),
        headers: response.headers,
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: error }),
      };
    }
  } else if (event && event.path.startsWith('/manageUserSubmissionsTable')) {
    const pathSuffix = event.path.substring('/manageUserSubmissionsTable'.length);
    
    let url = `${manageUserSubmissionsTableApiEndpoint}`;

    if (event.httpMethod === "GET") {
      url += pathSuffix;
    }
    
    const options = {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        'x-api-key': apiKey,
        'Host': manageUserSubmissionsTableApiHost,
      },
    data: event.httpMethod === 'PUT' ? event.body : null,
    };

    try {
      const response = await axios(url, options);

      return {
        statusCode: response.status,
        body: JSON.stringify(response.data),
        headers: response.headers,
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal Server Error" }),
      };
    }
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Not Found"}),
    };
  }
};
