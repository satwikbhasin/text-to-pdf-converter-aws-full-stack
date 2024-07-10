#!/usr/bin/env python3

import sys
import requests
from fpdf import FPDF

# Global variables for API endpoints
DYNAMODB_API_ENDPOINT = "<DYNAMODB_API_ENDPOINT>"
S3_API_ENDPOINT = "<S3_API_ENDPOINT>"
BUCKET_NAME = "<BUCKET_NAME>"


def get_dynamodb_entry(submission_id):
    """Retrieve the DynamoDB entry using the submission ID."""
    dynamoDB_URL = f"{DYNAMODB_API_ENDPOINT}/{submission_id}"
    response = requests.get(dynamoDB_URL)
    response.raise_for_status()
    return response.json()


def get_signed_s3_url(s3_path, type):
    """Get the signed URL for downloading/uploading the file from/to S3."""
    GetS3SignedURL = f"{S3_API_ENDPOINT}"

    if type == "download":
        params = {"type": "download", "s3_path": s3_path}
    else:
        params = {
            "type": "upload",
            "s3_path": s3_path,
            "fileType": "application/pdf",
        }

    response = requests.get(GetS3SignedURL, params=params)
    response.raise_for_status()

    return (
        response.json().get("downloadURL")
        if type == "download"
        else response.json().get("uploadURL")
    )


def download_file_from_s3(signed_url, download_path):
    """Download the file using the signed URL and save it to the specified path."""
    response = requests.get(signed_url)
    response.raise_for_status()
    with open(download_path, "wb") as file:
        file.write(response.content)


def upload_file_to_s3(file_path, signed_url):
    """Upload the file to S3 using the signed URL."""
    try:
        with open(file_path, "rb") as file:
            files = {"file": file}
            response = requests.put(
                signed_url,
                files=files,
                headers={
                    "Content-Type": "application/pdf",
                },
            )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while uploading the file to S3: {e}")


def convert_to_pdf(input_path, output_path):
    """Convert the input file to a PDF and save it to the specified path."""
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=10)
    
        with open(input_path, 'r') as file:
            for line in file:
                pdf.cell(200, 10, txt=line, ln=True)
    
        pdf.output(output_path)
    except Exception as e:
        print(f"An error occurred: {e}")


def insert_file_to_dynamodb(new_s3_path, dynamoDBSubmissionEntry):
    """Update the DynamoDB entry with the new S3 path."""
    try:
        dynamoDB_URL = f"{DYNAMODB_API_ENDPOINT}"
        data = {
            "id": dynamoDBSubmissionEntry.get("id"),
            "submitter": "server",
            "fileS3Path": new_s3_path,
            "pdfName": dynamoDBSubmissionEntry.get("pdfName"),
        }
        response = requests.put(dynamoDB_URL, json=data)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while updating DynamoDB: {e}")


def process_submission(submission_id):
    """Main function to process the submission."""
    try:
        # Retrieve DynamoDB entry
        dynamoDBSubmissionEntry = get_dynamodb_entry(submission_id)
        s3_path = dynamoDBSubmissionEntry.get("fileS3Path")
        pdfName = dynamoDBSubmissionEntry.get("pdfName")

        # Download the text file from S3
        signedS3URL = get_signed_s3_url(s3_path, "download")
        downloaded_file_path = "/tmp/downloaded_file.txt"
        download_file_from_s3(signedS3URL, downloaded_file_path)

        # Convert the downloaded file to PDF
        pdf_output_path = f"/tmp/{pdfName}.pdf"
        convert_to_pdf(downloaded_file_path, pdf_output_path)

        # Upload the PDF file to S3
        new_s3_key = s3_path.split("/", 1)[0] + f"/{pdfName}.pdf"
        signedS3URL = get_signed_s3_url(new_s3_key, "upload")
        upload_file_to_s3(pdf_output_path, signedS3URL)

        # Update the DynamoDB entry with the new S3 path
        insert_file_to_dynamodb(new_s3_key, dynamoDBSubmissionEntry)

    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: script.py <submission_id>")
        sys.exit(1)

    submission_id = sys.argv[1]
    process_submission(submission_id)
