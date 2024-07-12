#!/bin/bash

# AWS region for the stacks
region="us-east-1"

# CDK Deployment
cdk synth
cdk bootstrap
cdk deploy BackendStack

echo "--- Deployment Done ---"