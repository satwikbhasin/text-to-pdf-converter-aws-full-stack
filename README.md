# aws-full-stack-demo-app

## Amplify Deployment Link
[https://main.d1p4du9gsoojvb.amplifyapp.com/
](https://main.du0zlvfacbhap.amplifyapp.com)
## Frontend Setup

***Note:** Make sure you have Node.js installed, we will be using `npm`*

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

## Backend Setup

**Note:** Before deploying with AWS CDK, ensure that `aws-cdk`, `awscli`, and `aws-sdk` are installed. Additionally, make sure you are logged into AWS CLI using the root user account you intend to deploy the CDK to

- Navigate to the backend directory
  
   ```sh
   cd backend
   ```
   
- Deploy the stack to CDK using my custom script named ***deploy.sh***
  
  ```sh
  ./deploy.sh
  ```
  For more details on how ***deploy.sh*** works and its configuration, refer to the script explanation below.

## **deploy.sh** Script Explanation

### Overview

The `deploy.sh` script automates the deployment and configuration of an AWS CDK stack named `BackendStack`. It handles initial deployment, captures API endpoints and a bucket name from the deployed stack, updates local scripts and a Lambda function with these endpoints, and performs a final CDK deployment.

### Script Breakdown

#### Initial CDK Deployment

Deploy the BackendStack initially

```bash
cdk deploy
```  

#### Capture API Endpoints and Bucket Name

After deployment, retrieve outputs from the CloudFormation stack

```bash
dynamodb_api_endpoint=$(aws cloudformation describe-stacks \
                --stack-name BackendStack \
                --query "Stacks[0].Outputs[?OutputKey=='DynamoDBAPIEndpoint'].OutputValue" \
                --output text)

s3_api_endpoint=$(aws cloudformation describe-stacks \
                --stack-name BackendStack \
                --query "Stacks[0].Outputs[?OutputKey=='S3APIEndpoint'].OutputValue" \
                --output text)

bucket_name=$(aws cloudformation describe-stacks \
                --stack-name BackendStack \
                --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
                --output text)
```

#### Update Local Scripts
Update ***script.py*** with necessary ***generateSignedS3UrlAPI***, ***manageUserSubmissionsTableApi*** API endpoints and ***user-files*** bucket name

```bash
script_template="assets/script/template/script.py"
script_output="assets/script/deploy/script.py"
sed -e "s|<DYNAMODB_API_ENDPOINT>|${dynamodb_api_endpoint//\//\\/}|g; s|<S3_API_ENDPOINT>|${s3_api_endpoint//\//\\/}|g; s|<BUCKET_NAME>|${bucket_name//\//\\/}|g" $script_template > $script_output
```

#### Update Lambda Function
Update **createVm_and_runScript.js** Lambda function with the ***generateSignedS3UrlAPI*** endpoint

```bash
createVm_and_runScript_lambda_template="lambda/createVm_and_runScript/template/createVm_and_runScript.js"
createVm_and_runScript_lambda_updated="lambda/createVm_and_runScript/createVm_and_runScript.js"
sed -e "s|<S3_SIGN_API>|${s3_api_endpoint//\//\\/}|g" $createVm_and_runScript_lambda_template > $createVm_and_runScript_lambda_updated
```

#### Final CDK Deployment

Completes the deployment process for BackendStack, ensuring all configurations are applied.

```bash
cdk deploy
```

## **script.py** Script Explanation

### Overview

This script executes within an EC2 instance triggered by events with entryType **"input"** in DynamoDB

- Retrieves submission details from DynamoDB
- Modifies and uploads files to S3
- Updates DynamoDB with file paths and submission details

### Functions

- **`get_from_dynamodb_using_submission_id(submission_id)`**: Retrieves submission details from DynamoDB and downloads files from S3
  
- **`modify_input_file(inputText, input_file_path)`**: Modifies input files and renames them as requested

- **`upload_to_s3(file_path)`**: Uploads files to S3 using signed URLs obtained from an API

- **`write_to_dynamodb(s3_path, submission_id, inputText)`**: Writes submission details back to DynamoDB

### Execution

The script reads a `submissionId` from a file, processes the submission through the defined functions, and updates DynamoDB with the results

### Note
The **entryType** attribute with a value of **"input"** in DynamoDB ensures that the EC2 instance is launched only when a user submits a file, not when the script itself performs operations. Conversely, when the script submits data, it marks the entry with **"output"** as the **entryType**. This differentiation clarifies that the EC2 instance is triggered specifically in response to user submissions, distinguishing it from automated script actions and avoiding an infinite loop.

## API's

## `generateSignedS3UrlApi` 

The `generateSignedS3UrlApi` is attached to a lambda function named `generateSignedS3Url` which generates signed URLs for secure access to objects stored in an Amazon S3 bucket. These URLs grant temporary, controlled access to specified resources without exposing AWS credentials.    

## `manageUserSubmissionsTableApi`

The `manageUserSubmissionsTableApi` is attached to a lambda function named `manageUserSubmissionsTable` which is designed to manage submissions within a database table named `userSubmissionsTable`. This API allows operations such as creating new submissions, retrieving submission details, updating existing submissions.


## How to download output file

You can use the `generateSignedS3UrlAPI` to obtain a signed URL for downloading files from an S3 bucket. Here's how you can do it using Postman:

- **Endpoint**: `https://78xeq1omd9.execute-api.us-east-1.amazonaws.com/prod/uploads`
- **Method**: `GET`
- **Parameters**:
  - `type`: `"download"`
  - `key`: Specify the filename/key of the file you want to download from S3
  - 
### Usage Example 
In Postman or your preferred HTTP client, set up a GET request to the following endpoint

`https://78xeq1omd9.execute-api.us-east-1.amazonaws.com/prod/uploads?type=download&key=output_h3Z3OxX5I6pG2NhabayP7~tester.txt`

Replace `output_h3Z3OxX5I6pG2NhabayP7~tester.txt` with the actual filename/key of the file you want to download from your S3 bucket.

### Note

Simply open the signed URL in your browser to initiate the download of the specified file from S3. Ensure that you have appropriate permissions and that the `key` parameter matches an existing file in your S3 bucket.




