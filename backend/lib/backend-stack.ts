import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import {
  aws_s3 as s3,
  aws_lambda as lambda,
  aws_dynamodb as dynamodb,
  aws_apigateway as apigateway,
  aws_iam as iam,
  aws_s3_deployment as s3deploy,
} from "aws-cdk-lib";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Existing S3 bucket declaration
    const fovusSubmissionFilesBucket = new s3.Bucket(this, "fovusSubmissionFiles", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    fovusSubmissionFilesBucket.addCorsRule({
      allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
      allowedOrigins: ["*"],
      allowedHeaders: ["*"],
      exposedHeaders: ["ETag"],
      maxAge: 3000,
    });

    const getSignedS3UrlRole = new iam.Role(this, "getSignedS3UrlRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    // Attach policy granting full access to S3
    getSignedS3UrlRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );

    // Existing Lambda function declaration
    const generateSignedS3Url = new lambda.Function(
      this,
      "generateSignedS3Url",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "generateSignedS3Url.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../lambda/generateSignedS3Url")
        ),
        environment: {
          UploadBucket: fovusSubmissionFilesBucket.bucketName,
        },
        role: getSignedS3UrlRole,
      }
    );

    // New DynamoDB table declaration
    const fovusSubmissionsTable = new dynamodb.Table(
      this,
      "fovusSubmissionsTable",
      {
        partitionKey: {
          name: "id",
          type: dynamodb.AttributeType.STRING,
        },
        stream: dynamodb.StreamViewType.NEW_IMAGE,
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      }
    );

    // Add ManageFovusSubmissionsTable Lambda function
    const manageSubmissionsTableLambda = new lambda.Function(
      this,
      "manageSubmissionsTableLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "manageSubmissionsTableLambda.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../lambda/manageSubmissionsTableLambda")
        ),
        environment: {
          TableName: fovusSubmissionsTable.tableName,
        },
      }
    );

    fovusSubmissionsTable.grantReadWriteData(manageSubmissionsTableLambda);

    const createVMAndRunScriptLambdaRole = new iam.Role(
      this,
      "CreateVMAndRunScriptRole",
      {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      }
    );

    // Attach policy granting full access to S3
    createVMAndRunScriptLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );

    // Attach policy granting full access to DynamoDB
    createVMAndRunScriptLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess")
    );

    // Attach policy granting full access to Lambda
    createVMAndRunScriptLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AWSLambda_FullAccess")
    );

    // Attach policy granting full access to EC2
    createVMAndRunScriptLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2FullAccess")
    );

    // CreateVM_and_runScript Lambda function
    const createVMAndRunScriptLambda = new lambda.Function(
      this,
      "createVM_and_runScript",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "createVM_and_runScript.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../lambda/createVM_and_runScript")
        ),
        role: createVMAndRunScriptLambdaRole,
      }
    );

    createVMAndRunScriptLambda.addEventSourceMapping("createVM_and_runScript", {
      eventSourceArn: fovusSubmissionsTable.tableStreamArn,
      batchSize: 1,
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
    });

    manageSubmissionsTableLambda.addEnvironment(
      "TABLE_NAME",
      fovusSubmissionsTable.tableName
    );
    fovusSubmissionsTable.grantReadWriteData(manageSubmissionsTableLambda);

    // Create an API Gateway REST API
    const manageSubmissionsTableAPI = new apigateway.RestApi(
      this,
      "manageSubmissionsTableAPI",
      {
        restApiName: "manageSubmissionsTableAPI",
        description: "To manage Fovus submissions table",
      }
    );

    const submissionsRootResource =
    manageSubmissionsTableAPI.root.addResource("fovusSubmissions");
    submissionsRootResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(manageSubmissionsTableLambda)
    );
    submissionsRootResource.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: ["PUT", "OPTIONS"],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "X-Amz-Date",
        "X-Api-Key",
        "X-Amz-Security-Token",
      ],
      maxAge: cdk.Duration.minutes(5),
    });

    const submissionsIDResource = submissionsRootResource.addResource("{id}");
    submissionsIDResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(manageSubmissionsTableLambda)
    );
    submissionsIDResource.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: ["GET", "OPTIONS"],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "X-Amz-Date",
        "X-Api-Key",
        "X-Amz-Security-Token",
      ],
      maxAge: cdk.Duration.minutes(5),
    });

    // Create an API Gateway REST API
    const generateSignedS3UrlAPI = new apigateway.RestApi(
      this,
      "generateSignedS3UrlAPI",
      {
        restApiName: "generateSignedS3UrlAPI",
        description: "To get signed S3 upload/download url",
      }
    );

    const generateSignedS3UrlResource =
      generateSignedS3UrlAPI.root.addResource("uploads");
    generateSignedS3UrlResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(generateSignedS3Url)
    );

    generateSignedS3UrlResource.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: ["GET", "OPTIONS"],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "X-Amz-Date",
        "X-Api-Key",
        "X-Amz-Security-Token",
      ],
      maxAge: cdk.Duration.minutes(5),
    });

    // Deploy scripts.py to S3 bucket
    new s3deploy.BucketDeployment(this, "DeployScripts", {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, "../assets/script/deploy")),
      ],
      destinationBucket: fovusSubmissionFilesBucket,
    });

    new cdk.CfnOutput(this, "DynamoDBAPIEndpoint", {
      value: manageSubmissionsTableAPI.url,
      description: "Endpoint for the Fovus submissions table API",
    });

    new cdk.CfnOutput(this, "S3APIEndpoint", {
      value: generateSignedS3UrlAPI.url,
      description: "Endpoint for the Fovus submission files S3 bucket API",
    });

    new cdk.CfnOutput(this, "BucketName", {
      value: fovusSubmissionFilesBucket.bucketName,
      description: "The name of the S3 bucket for Fovus submission files",
    });
  }
}
