import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { Construct } from "constructs";

interface LambdaStackProps extends cdk.StackProps {
  bucketName: string;
  tableName: string;
  tableStreamArn: string;
}

export class LambdaStack extends cdk.Stack {
  public readonly generateSignedS3Url: lambda.Function;
  public readonly manageUserSubmissionsTable: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const generateSignedS3UrlRole = new iam.Role(
      this,
      "GenerateSignedS3UrlRole",
      {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
        ],
      }
    );

    this.generateSignedS3Url = new lambda.Function(
      this,
      "generateSignedS3Url",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "generateSignedS3Url.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../../lambda/generateSignedS3Url")
        ),
        environment: {
          UploadBucket: props.bucketName,
        },
        role: generateSignedS3UrlRole,
      }
    );

    const manageUserSubmissionsTableRole = new iam.Role(
      this,
      "manageUserSubmissionsTableRole",
      {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonDynamoDBFullAccess"
          ),
        ],
      }
    );

    this.manageUserSubmissionsTable = new lambda.Function(
      this,
      "manageUserSubmissionsTable",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "manageUserSubmissionsTable.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../../lambda/manageUserSubmissionsTable")
        ),
        environment: {
          TableName: props.tableName,
        },
        role: manageUserSubmissionsTableRole,
      }
    );

    const createVmAndRunScriptRole = new iam.Role(
      this,
      "createVmAndRunScriptRole",
      {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonDynamoDBFullAccess"
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName("AWSLambda_FullAccess"),
          iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2FullAccess"),
        ],
      }
    );

    const createVmAndRunScript = new lambda.Function(
      this,
      "createVmAndRunScript",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "createVM_and_runScript.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../../lambda/createVM_and_runScript")
        ),
        role: createVmAndRunScriptRole,
      }
    );

    createVmAndRunScript.addEventSourceMapping("createVMAndRunScript", {
      eventSourceArn: props.tableStreamArn,
      batchSize: 1,
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
    });
  }
}
