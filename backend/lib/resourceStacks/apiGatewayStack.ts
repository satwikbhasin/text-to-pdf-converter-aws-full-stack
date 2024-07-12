import * as cdk from "aws-cdk-lib";
import {
  aws_apigateway as apigateway,
  aws_lambda as lambda,
  aws_ssm as ssm,
  aws_iam as iam,
  aws_secretsmanager as secretsmanager,
  SecretValue,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { GetApiKeyCr } from "./getApiKeyCr";

interface APIGatewayStackProps extends cdk.StackProps {
  tableName: string;
  manageUserSubmissionsTable: lambda.Function;
  generateSignedS3Url: lambda.Function;
}

export class APIGatewayStack extends cdk.Stack {
  public readonly generateSignedS3UrlApi: apigateway.RestApi;
  public readonly manageUserSubmissionsTableApi: apigateway.RestApi;
  public readonly apiKey: string;

  constructor(scope: Construct, id: string, props: APIGatewayStackProps) {
    super(scope, id, props);

    // Create API Gateway for generateSignedS3Url Lambda
    this.generateSignedS3UrlApi = new apigateway.RestApi(
      this,
      "generateSignedS3UrlApi",
      {
        restApiName: "generateSignedS3UrlApi",
        description: "To invoke generateSignedS3Url Lambda",
      }
    );

    // Create API Gateway for manageUserSubmissionsTable Lambda
    this.manageUserSubmissionsTableApi = new apigateway.RestApi(
      this,
      "manageUserSubmissionsTableApi",
      {
        restApiName: "manageUserSubmissionsTableApi",
        description: "To invoke manageUserSubmissionsTable Lambda",
      }
    );

    // Add GET method to generateSignedS3UrlApi with API key requirement
    this.generateSignedS3UrlApi.root.addMethod(
      "GET",
      new apigateway.LambdaIntegration(props.generateSignedS3Url),
      {
        apiKeyRequired: true,
      }
    );

    // Add CORS preflight configuration to generateSignedS3UrlApi
    this.generateSignedS3UrlApi.root.addCorsPreflight({
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

    // Add PUT method to manageUserSubmissionsTableApi with API key requirement
    this.manageUserSubmissionsTableApi.root.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(props.manageUserSubmissionsTable),
      {
        apiKeyRequired: true,
      }
    );

    // Add CORS preflight configuration to manageUserSubmissionsTableApi
    this.manageUserSubmissionsTableApi.root.addCorsPreflight({
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

    // Add GET method to manageUserSubmissionsTableApi/{id} with API key requirement
    const singleEntryInTableResource =
      this.manageUserSubmissionsTableApi.root.addResource("{id}");
    singleEntryInTableResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(props.manageUserSubmissionsTable),
      {
        apiKeyRequired: true,
      }
    );

    // Add CORS preflight configuration to manageUserSubmissionsTableApi/{id}
    singleEntryInTableResource.addCorsPreflight({
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

    const generateSignedS3UrlParameterName =
      "/assets/api-endpoints/generateSignedS3Url";
    const manageUserSubmissionsTableParameterName =
      "/assets/api-endpoints/manageUserSubmissionsTable";

    new ssm.StringParameter(this, "GenerateSignedS3UrlParameter", {
      parameterName: generateSignedS3UrlParameterName,
      stringValue: this.generateSignedS3UrlApi.url,
    });

    new ssm.StringParameter(this, "ManageUserSubmissionsTableParameter", {
      parameterName: manageUserSubmissionsTableParameterName,
      stringValue: this.manageUserSubmissionsTableApi.url,
    });

    const apiKey = this.generateSignedS3UrlApi.addApiKey("ApiKey", {
      apiKeyName: "ApiKey",
    });

    const getApiKeyCr = new GetApiKeyCr(this, "GetApiKeyCr", { apiKey });

    new secretsmanager.Secret(this, "ApiKeysSecret", {
      secretName: "/assets/api-data",
      secretStringValue: SecretValue.unsafePlainText(
        JSON.stringify({
          apiKey: getApiKeyCr.apikeyValue,
          generateSignedS3UrlAPI: this.generateSignedS3UrlApi.url,
          manageUserSubmissionsTableAPI: this.manageUserSubmissionsTableApi.url,
        })
      ),
    });

    const usagePlan = this.generateSignedS3UrlApi.addUsagePlan("UsagePlan", {
      name: "Basic",
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
    });

    usagePlan.addApiKey(apiKey);

    usagePlan.addApiStage({
      stage: this.generateSignedS3UrlApi.deploymentStage,
    });
    usagePlan.addApiStage({
      stage: this.manageUserSubmissionsTableApi.deploymentStage,
    });

    this.apiKey = getApiKeyCr.apikeyValue;
  }
}
