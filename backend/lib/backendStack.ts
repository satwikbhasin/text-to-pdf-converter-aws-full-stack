import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { aws_iam as iam, aws_s3_deployment as s3deploy } from "aws-cdk-lib";

import { BucketStack } from "./resourceStacks/bucketStack";
import { LambdaStack } from "./resourceStacks/lambdaStack";
import { DynamoDBStack } from "./resourceStacks/dynamoDBStack";
import { APIGatewayStack } from "./resourceStacks/apiGatewayStack";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucketName = "aws-full-stack-demo-app-user-files";
    const bucketStack = new BucketStack(this, "BucketStack", {
      bucketName: bucketName,
    });

    const tableName = "userSubmissionsTable";
    const tableStack = new DynamoDBStack(this, "DynamoDBStack", {
      tableName: tableName,
    });

    // Create the Lambda functions
    const allLambdas = new LambdaStack(this, "LambdaStack", {
      bucketName: bucketName,
      tableName: tableStack.userSubmissionsTable.tableName,
      tableStreamArn: tableStack.userSubmissionsTable.tableStreamArn!,
    });

    // Create the API Gateway endpoints
    const allAPIs = new APIGatewayStack(this, "APIGatewayStack", {
      tableName: tableName,
      manageUserSubmissionsTable: allLambdas.manageUserSubmissionsTable,
      generateSignedS3Url: allLambdas.generateSignedS3Url,
    });

    // Deploy scripts.py to S3 bucket
    new s3deploy.BucketDeployment(this, "DeployVmScript", {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, "../assets/VmScript")),
      ],
      destinationBucket: bucketStack.bucket,
    });

    // Output the API Gateway endpoints
    new cdk.CfnOutput(this, "signedS3UrlGeneratorApi", {
      value: allAPIs.generateSignedS3UrlApi.url,
      description: "Endpoint for the signedS3UrlGeneratorApi",
    });

    new cdk.CfnOutput(this, "manageUserSubmissionsTableApi", {
      value: allAPIs.manageUserSubmissionsTableApi.url,
      description: "Endpoint for the manageUserSubmissionsTableApi",
    });

    new cdk.CfnOutput(this, "API Key", {
      value: allAPIs.apiKey,
      description: "API Key for both API endpoints",
    });
  }
}
