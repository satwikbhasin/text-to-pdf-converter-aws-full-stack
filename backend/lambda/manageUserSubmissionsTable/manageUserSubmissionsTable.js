const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
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
