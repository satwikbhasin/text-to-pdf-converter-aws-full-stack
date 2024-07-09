import * as cdk from "aws-cdk-lib";
import { aws_apigateway as apigateway } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { Construct } from "constructs";

interface APIGatewayStackProps extends cdk.StackProps {
  tableName: string;
  manageUserSubmissionsTable: lambda.Function;
  generateSignedS3Url: lambda.Function;
}

export class APIGatewayStack extends cdk.Stack {
  public readonly generateSignedS3UrlApi: apigateway.RestApi;
  public readonly manageUserSubmissionsTableApi: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: APIGatewayStackProps) {
    super(scope, id, props);

    this.generateSignedS3UrlApi = new apigateway.RestApi(
      this,
      "generateSignedS3UrlApi",
      {
        restApiName: "generateSignedS3UrlApi",
        description: "To invoke generateSignedS3Url Lambda",
      }
    );

    this.generateSignedS3UrlApi.root.addMethod(
      "GET",
      new apigateway.LambdaIntegration(props.generateSignedS3Url)
    );

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

    this.manageUserSubmissionsTableApi = new apigateway.RestApi(
      this,
      "manageUserSubmissionsTableApi",
      {
        restApiName: "manageUserSubmissionsTableApi",
        description: "To invoke manageUserSubmissionsTable Lambda",
      }
    );

    this.manageUserSubmissionsTableApi.root.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(props.manageUserSubmissionsTable)
    );

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

    const singleEntryInTableResource =
      this.manageUserSubmissionsTableApi.root.addResource("{id}");
    singleEntryInTableResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(props.manageUserSubmissionsTable)
    );

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
  }
}
