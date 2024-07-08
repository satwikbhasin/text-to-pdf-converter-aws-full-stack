'use strict'

const AWS = require('aws-sdk')

AWS.config.update({ region: process.env.AWS_REGION })
const s3 = new AWS.S3()

const URL_EXPIRATION_SECONDS = 300

exports.handler = async (event) => {
  if (event.queryStringParameters && event.queryStringParameters.type === 'download') {
    return await getDownloadURL(event)
  } else {
    return await getUploadURL(event)
  }
}

const getUploadURL = async function (event) {
  const originalFileName = event.queryStringParameters?.fileName || 'default.txt';
  const contentType = event.queryStringParameters?.fileType || 'text/plain';

  const Key = `${originalFileName}`;

  // Get signed URL from S3 for upload
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
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  }
}

const getDownloadURL = async function (event) {
  const Key = event.queryStringParameters.key

  // Get signed URL from S3 for download
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
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  }
}