import * as cdk from "aws-cdk-lib";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { Construct } from "constructs";

interface DynamoDBStackProps extends cdk.StackProps {
  tableName: string;
}

export class DynamoDBStack extends cdk.Stack {
  public readonly userSubmissionsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamoDBStackProps) {
    super(scope, id, props);

    this.userSubmissionsTable = new dynamodb.Table(this, props.tableName, {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });
  }
}
