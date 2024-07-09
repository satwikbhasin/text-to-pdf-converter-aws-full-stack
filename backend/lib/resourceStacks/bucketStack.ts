import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { Construct } from "constructs";

interface BucketStackProps extends cdk.StackProps {
  bucketName: string;
}

export class BucketStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: BucketStackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, props.bucketName, {
      bucketName: props.bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.bucket.addCorsRule({
      allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
      allowedOrigins: ["*"],
      allowedHeaders: ["*"],
      exposedHeaders: ["ETag"],
      maxAge: 3000,
    });
  }
}
