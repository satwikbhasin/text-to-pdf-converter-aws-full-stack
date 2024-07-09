#!/usr/bin/env python3

import os
import sys
import requests
import json

# Global variables for API endpoints
dynamodb = f"<DYNAMODB_API_ENDPOINT>"
s3 = f"<S3_API_ENDPOINT>"
bucket_name_from_cdk = f"<BUCKET_NAME>"

def get_from_dynamodb_using_submission_id(submission_id):
    try:
        
        dynamoDB_URL = f"{dynamodb}/{submission_id}"
        response = requests.get(dynamoDB_URL)

        if response.status_code != 200:
            print("Failed to retrieve submission entry from DynamoDB")
            return

        dynamoDBSubmissionEntry = response.json()
        # Extract the S3 path and key from DynamoDB entry
        s3Path = dynamoDBSubmissionEntry.get('fileS3Path')
        inputText = dynamoDBSubmissionEntry.get('text')
        s3_key = s3Path.split('/', 1)[-1]

        # API endpoint to get the signed URL for file download
        GetS3SignedURL = f"{s3}"
        params = {
            "type": "download",
            "key": s3_key
        }

        # Make a GET request to the API endpoint to get the signed URL
        signedS3URLResponse = requests.get(GetS3SignedURL, params=params)

        if signedS3URLResponse.status_code != 200:
            print("Failed to retrieve signed S3 URL")
            return

        signedS3URL = signedS3URLResponse.json().get("downloadURL")

        # Use the signed URL to download the file from S3
        fileResponse = requests.get(signedS3URL)

        if fileResponse.status_code != 200:
            print("Failed to download the file from S3")
            return

        # Save the file locally with the same name as s3_key
        with open(s3_key, 'wb') as f:
            f.write(fileResponse.content)

        return inputText, s3_key

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        sys.exit(1)


def modify_input_file(inputText, input_file_path):
    inputTextLength = len(inputText)

    with open(input_file_path, 'a') as file:
        file.write(f"{inputTextLength}")
        file.write(" : ")
        file.write(f"{inputText}")

    base_file_path = os.path.splitext(input_file_path)[0]
    new_file_path = base_file_path.replace('input_', 'output_') + '.txt'

    # Rename the file
    os.rename(input_file_path, new_file_path)

    return new_file_path


def upload_to_s3(file_path):
    # Get the signed URL from the API
    try:
        url = f"{s3}?fileName={file_path}"
        response = requests.get(url)
        signed_url = response.json().get("uploadURL")
    except Exception as e:
        print(f"Failed to get signed URL: {e}")
        return

    # Read the file content into a blob
    try:
        with open(file_path, 'rb') as file:
            file_blob = file.read()
    except Exception as e:
        print(f"Failed to read file into blob: {e}")
        return

    try:
        # Upload the blob to S3 using the signed URL
        upload_response = requests.put(signed_url, data=file_blob, headers={
            "Content-Type": "text/plain",
        })
        upload_response.raise_for_status()
        print("Blob uploaded successfully")
    except Exception as e:
        print(f"Failed to upload blob: {e}")

    s3_object_key = signed_url.split("?")[0].split("/")[-1]
    bucket_name = f"{bucket_name_from_cdk}"
    s3_path = f"{bucket_name}/{s3_object_key}"

    return s3_path;


def write_to_dynamodb(s3_path, submission_id, inputText):
    url = f'{dynamodb}'
    payload = {
        "id": submission_id,
        "text": inputText,
        "fileS3Path": s3_path,
        "entryType": "output"
    }

    headers = {
        'Content-Type': 'application/json'
    }

    try:
        response = requests.put(url, data=json.dumps(payload), headers=headers)
        response.raise_for_status()
    except Exception as e:
        print(f"An error occurred: {str(e)}")


def main():
    try:
        with open('submissionId.txt', 'r') as file:
            submission_id = file.read().strip()
    except Exception as e:
        print(f"Error reading submissionId from file: {str(e)}")
        sys.exit(1)

    inputText, input_file_path = get_from_dynamodb_using_submission_id(submission_id)

    modified_file_path = modify_input_file(inputText, input_file_path)

    s3_path = upload_to_s3(modified_file_path)

    write_to_dynamodb(s3_path, submission_id, inputText)


if __name__ == "__main__":
    main()
