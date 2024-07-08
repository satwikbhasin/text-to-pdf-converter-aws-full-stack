#!/bin/bash

# Initial CDK Deployment
cdk deploy 
echo "--- Initial Deployment Done ---"

# Capture the API endpoints & Bucket name directly from AWS CLI
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

# Update the local script with the API endpoints and Bucket Name
script_template="assets/script/template/script.py"
script_output="assets/script/deploy/script.py"
sed -e "s|<DYNAMODB_API_ENDPOINT>|${dynamodb_api_endpoint//\//\\/}|g; s|<S3_API_ENDPOINT>|${s3_api_endpoint//\//\\/}|g; s|<BUCKET_NAME>|${bucket_name//\//\\/}|g" $script_template > $script_output
echo "--- Local Script Updated ---"

# Update the existing lambda script with the API endpoint 
createVm_and_runScript_lambda_template="lambda/createVm_and_runScript/template/createVm_and_runScript.js"
createVm_and_runScript_lambda_updated="lambda/createVm_and_runScript/createVm_and_runScript.js"
sed -e "s|<S3_SIGN_API>|${s3_api_endpoint//\//\\/}|g" $createVm_and_runScript_lambda_template > $createVm_and_runScript_lambda_updated
echo "--- Local Lambda createVm_and_runScript Updated ---"

# Final CDK Deployment
cdk deploy 
echo "--- Final Deployment Complete ---"
