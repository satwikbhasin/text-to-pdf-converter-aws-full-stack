# text-to-pdf-converter / aws-full-stack-demo-app

The text-to-PDF converter app lets users upload text files, converts them to PDF format using AWS services, and provides the PDFs for download. The app uses a serverless backend with S3 for storage, Lambda functions for processing, DynamoDB for metadata, and EC2 instances for conversion. 

Check it out [here](https://main.d3fcjrh4xirwm0.amplifyapp.com)

## Application Flow

1. **User Interaction:**

   - User submits a text file through the frontend application.

2. **Frontend Action:**

   - Frontend sends a request to a proxy Lambda function to obtain a signed S3 URL for uploading the file.
   - Frontend uses the signed S3 URL to upload the user's file directly to an S3 bucket.
   - Upon successful upload, a new entry is inserted into DynamoDB, containing metadata about the uploaded file.

3. **DynamoDB Trigger:**

   - The DynamoDB entry triggers a Lambda function to execute.

4. **Lambda Execution:**

   - The Lambda function initiates the creation of an EC2 instance.

5. **EC2 Instance Action:**

   - The EC2 instance runs a script that converts the text file to PDF format.
   - Once converted, the PDF file is uploaded back to the same or a different S3 bucket.
   - DynamoDB entry updated with the new location and details of the converted PDF file.

6. **User Interaction (Download):**
   - The user can download the converted PDF file through the frontend application.

This app utilizes AWS services like S3, API Gateway, DynamoDB, Lambda, and EC2 in a structured and efficient manner.

**\*Note:** Make sure you have Node.js installed, we will be using `npm`\*

## Backend Setup

**\*Note:** Before deploying with AWS CDK, ensure that `aws-cdk`, `awscli`, and `aws-sdk` are installed. Additionally, make sure you are logged into AWS CLI using the root/IAM account you intend to deploy the CDK to\*

- Navigate to the backend directory

  ```sh
  cd backend
  ```

- Install dependencies

  ```sh
  npm install
  ```

- Deploy the stack to CDK using my custom script named **_deploy.sh_**

  ```sh
  ./deploy.sh
  ```

  This deployment outputs the `API key` & `API endpoints` for `generateSignedS3UrlApi` & `manageUserSubmissionsTableApi`. Please note these down as you will need these for the frontend.

  For more details on how **_deploy.sh_** works and its configuration, refer to the script explanation below.

## Frontend Setup

- Navigate to the frontend directory

  ```sh
  cd frontend
  ```

- Install dependencies

  ```
  npm install
  ```

- Launch the app

  ```
  npm start
  ```

  Be sure to populate the `.env.github` file with the `API endpoints generated by the backend` and `rename it to .env`.

  I've implemented a proxy Lambda function combination to securely handle API calls using the keys. If you opt not to use the proxy, remember to include your backend-generated
  API key as a header named `x-api-key` in your requests to the backend.

## **deploy.sh** Script Explanation

### Overview

The `deploy.sh` script automates the deployment and configuration of an AWS CDK stack named `BackendStack`.

### Script Breakdown

Specify the AWS region for your stack deployment.

```bash
region="us-east-1"
```

Generate the CloudFormation templates from your AWS CDK app.

```bash
cdk synth
```

Sets up necessary resources (S3, Lambda, DynamoDB, etc.) for the CDK environment.

```bash
cdk bootstrap
```

Deploys the CloudFormation stack named `BackendStack` to your AWS account.

```bash
cdk deploy BackendStack
```

## **script.py** Script Explanation

### Overview

This python script executes within an EC2 instance triggered by events with submitter entry as **"user"** in DynamoDB

- Retrieves submission details from DynamoDB
- Downloads the file linked to submission from S3
- Converts the txt file to pdf and uploads back to S3
- Updates DynamoDB with updated s3 file path and submitter entry as **"server"**

### Arguments

When the EC2 Instance is spinned off from the lambda, it is passed a user data script to execute. That script downloads this(script.py) scipt to the instance and executes it with following arguments

`MANAGE_USER_SUBMISSIONS_TABLE_API` => API endpoint for the manageUserSubmissionsTableApi

`GENERATE_SIGNED_S3_URL_API` => API endpoint for the generateSignedS3UrlApi

`SUBMISSION_ID` = Submission ID for which text file needs to be converted to PDF

`API_KEY` => API_KEY for both the API's mentioned above

### Main Functions

- **`get_dynamodb_entry()`**: Retrieves submission details from DynamoDB and downloads files from S3

- **`get_signed_s3_url()`**: Gets signed URL from `generateSignedS3UrlApi` for uploading/downloading files using the `API_KEY`

- **`download_file_from_s3()`**: Downloads file from S3 bucket using the signed URL

- **`upload_file_to_s3()`**: Uploads file to S3 bucket using the signed URL
- **`convert_to_pdf()`**: Converts the downloaded text file to pdf

- **`insert_file_to_dynamodb()`**: Updates the S3 path for the pdf and submitter entry as **"server"** for the current submission

- **`process_submission()`**: Handles above functions in order

### Note

The **submitter** attribute with a value of **"user"** in DynamoDB ensures that the EC2 instance is launched only when a user submits a text file, not when the script itself performs operations. Conversely, when the script submits data, it marks the entry with **"server"** as the **submitter**. This differentiation clarifies that the EC2 instance is triggered specifically in response to user submissions, distinguishing it from automated script actions and avoiding an infinite loop.

## API's

## `generateSignedS3UrlApi`

The `generateSignedS3UrlApi` is attached to a lambda function named `generateSignedS3Url` which generates signed URLs for secure access to objects stored in an Amazon S3 bucket. These URLs grant temporary, controlled access to specified resources without exposing AWS credentials.

## `manageUserSubmissionsTableApi`

The `manageUserSubmissionsTableApi` is attached to a lambda function named `manageUserSubmissionsTable` which is designed to manage submissions within a database table named `userSubmissionsTable`. This API allows operations such as creating new submissions, retrieving submission details, updating existing submissions.
