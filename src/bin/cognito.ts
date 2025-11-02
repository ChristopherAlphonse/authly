#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CognitoStack } from "../app/aws";

const app = new cdk.App();

export const cognitoStack = new CognitoStack(app, "AuthlyCognitoStack", {});
