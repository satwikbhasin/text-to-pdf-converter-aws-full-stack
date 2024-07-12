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
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  AwsSdkCall,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { IApiKey } from "aws-cdk-lib/aws-apigateway";

export interface GetApiKeyCrProps {
  apiKey: IApiKey;
}

export interface GetApiKeyCrProps {
  apiKey: apigateway.IApiKey;
}

export class GetApiKeyCr extends Construct {
  public readonly apikeyValue: string;

  constructor(scope: Construct, id: string, props: GetApiKeyCrProps) {
    super(scope, id);

    const apiKey: AwsSdkCall = {
      service: "APIGateway",
      action: "getApiKey",
      parameters: {
        apiKey: props.apiKey.keyId,
        includeValue: true,
      },
      physicalResourceId: PhysicalResourceId.of(`APIKey:${props.apiKey.keyId}`),
    };

    const apiKeyCr = new AwsCustomResource(this, "api-key-cr", {
      policy: AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [props.apiKey.keyArn],
          actions: ["apigateway:GET"],
        }),
      ]),
      logRetention: RetentionDays.ONE_DAY,
      onCreate: apiKey,
      onUpdate: apiKey,
    });

    apiKeyCr.node.addDependency(props.apiKey);
    this.apikeyValue = apiKeyCr.getResponseField("value");
  }
}
