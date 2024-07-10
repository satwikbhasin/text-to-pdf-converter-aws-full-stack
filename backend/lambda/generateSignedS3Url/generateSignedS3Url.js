'use strict'

const AWS = require('aws-sdk')

AWS.config.update({ region: process.env.AWS_REGION })
const s3 = new AWS.S3()

const URL_EXPIRATION_SECONDS = 30
const ALLOWED_ORIGINS = ['https://main.du0zlvfacbhap.amplifyapp.com']
const ALLOWED_METHODS = ['GET']

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
        "Access-Control-Allow-Methods": "GET",
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
        "Access-Control-Allow-Origin": event.headers.origin,
        "Access-Control-Allow-Methods": ALLOWED_METHODS.join(', '),
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  }

  if (event.queryStringParameters && event.queryStringParameters.type === 'download') {
    return await getDownloadURL(event)
  } else {
    return await getUploadURL(event)
  }
}

const getUploadURL = async function (event, origin) {
  const Key = event.queryStringParameters?.s3_path || 'lost';
  const contentType = event.queryStringParameters?.fileType;

  if (!Key || !contentType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required parameters' }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": event.headers.origin,
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  }

  const s3Params = {
    Bucket: process.env.UploadBucket,
    Key,
    Expires: URL_EXPIRATION_SECONDS,
    ContentType: contentType,
  }

  const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params)

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadURL: uploadURL
    }),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  }
}

const getDownloadURL = async function (event, origin) {
  const Key = event.queryStringParameters.s3_path

  if (!Key) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required parameters' }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  }

  const s3Params = {
    Bucket: process.env.UploadBucket,
    Key,
    Expires: URL_EXPIRATION_SECONDS
  }

  const downloadURL = await s3.getSignedUrlPromise('getObject', s3Params)

  return {
    statusCode: 200,
    body: JSON.stringify({
      downloadURL: downloadURL
    }),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  }
}