#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { BackendStack } from "../lib/backendStack";

const app = new cdk.App();
new BackendStack(app, "BackendStack");
