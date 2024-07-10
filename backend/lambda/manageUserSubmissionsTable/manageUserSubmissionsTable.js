const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const ALLOWED_ORIGINS = ['https://main.du0zlvfacbhap.amplifyapp.com, http://localhost:3000']
const ALLOWED_METHODS = ['GET', 'PUT', 'OPTIONS']

exports.handler = async (event) => {
  const requestOrigin = event.headers.origin
  const requestMethod = event.httpMethod

  if (!ALLOWED_ORIGINS.includes(requestOrigin)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Forbidden' }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": requestOrigin,
        "Access-Control-Allow-Methods": ALLOWED_METHODS.join(', '),
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  }

  if (!ALLOWED_METHODS.includes(requestMethod)) {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": requestOrigin,
        "Access-Control-Allow-Methods": ALLOWED_METHODS.join(', '),
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  }


  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    switch (event.httpMethod) {
      case "PUT":
        const parsedBody = JSON.parse(event.body);

        const submissionId = parsedBody.id;
        const pdfName = parsedBody.pdfName;
        const fileS3Path = parsedBody.fileS3Path;
        const submitter = parsedBody.submitter;

        await dynamo.send(
          new PutCommand({
            TableName: process.env.TableName,
            Item: {
              id: submissionId,
              pdfName: pdfName,
              fileS3Path: fileS3Path,
              submitter: submitter,
            },
          })
        );

        body = `Put item ${submissionId}`;
        break;

      case "GET":
        body = await dynamo.send(
          new GetCommand({
            TableName: process.env.TableName,
            Key: {
              id: event.pathParameters.id,
            },
          })
        );
        body = body.Item;
        break;

      default:
        statusCode = 405;
        body = `Unsupported method: ${event.routeKey}`;
        break;
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
