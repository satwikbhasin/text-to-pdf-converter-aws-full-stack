# fovus-coding-challenge

## Frontend Setup

***Note:** Make sure you have Node.js installed, we will be using **npm***

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

**Note:** Before deploying with AWS CDK, ensure that `aws-cdk`, `awscli`, and `aws-sdk` are installed. Additionally, make sure you are logged into AWS with the account you intend to deploy the CDK to*

- Navigate to the backend directory
  
   ```sh
   cd backend
   ```
   
- Deploy the stack to CDK using my custom script named **deploy.sh**
  
  ```sh
  ./deploy.ch
  ```

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
Update script.py with API endpoints and bucket name

```bash
script_template="assets/script/template/script.py"
script_output="assets/script/deploy/script.py"
sed -e "s|<DYNAMODB_API_ENDPOINT>|${dynamodb_api_endpoint//\//\\/}|g; s|<S3_API_ENDPOINT>|${s3_api_endpoint//\//\\/}|g; s|<BUCKET_NAME>|${bucket_name//\//\\/}|g" $script_template > $script_output
```

#### Update Lambda Function
Update **createVm_and_runScript.js** Lambda function with the ***S3 SIGNED URL GENERATOR API*** endpoint

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
