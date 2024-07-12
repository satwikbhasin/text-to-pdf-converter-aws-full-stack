import { Handler } from "aws-lambda";
import fetch from "node-fetch";
import { env } from "$amplify/env/proxy-function";

const allowedDomains = [
  "http://localhost:3000",
  "https://main.du0zlvfacbhap.amplifyapp.com/",
];

const handler: Handler = async (event) => {
  const endpointMap: { [key: string]: string | undefined } = {
    "/generateSignedS3UrlProxy": env.GENERATE_SIGNED_S3_URL_API_ENDPOINT,
    "/manageUserSubmissionsTableProxy":
      env.MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT,
  };

  const path = event.path;
  const endpoint = endpointMap[path];

  if (!endpoint) {
    return {
      statusCode: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allowedDomains.includes(
          event.headers.origin || ""
        )
          ? event.headers.origin
          : "",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body: JSON.stringify({ error: "Endpoint not found" }),
    };
  }

  const url = `${endpoint}${path}`;

  const headers: Record<string, string> = {
    "x-api-key": process.env.API_KEY || "",
  };

  Object.entries(event.headers).forEach(([key, value]) => {
    headers[key] = Array.isArray(value) ? value.join(", ") : String(value);
  });

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: headers,
      body:
        event.httpMethod !== "GET" && event.httpMethod !== "HEAD"
          ? JSON.stringify(event.body)
          : undefined,
    });

    const data = await response.json();
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allowedDomains.includes(
          event.headers.origin || ""
        )
          ? event.headers.origin
          : "",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allowedDomains.includes(
          event.headers.origin || ""
        )
          ? event.headers.origin
          : "",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

export { handler };
