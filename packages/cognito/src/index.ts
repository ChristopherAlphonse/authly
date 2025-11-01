import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import type { Construct } from "constructs";

export interface CognitoStackProps extends cdk.StackProps {
	domainPrefix?: string;
}

export class CognitoStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: CognitoStackProps) {
		super(scope, id, props);

		const userPool = new cognito.UserPool(this, "AuthlyUserPool", {
			userPoolName: "authly-user-pool",
			selfSignUpEnabled: true,
			signInAliases: { email: true },
			autoVerify: { email: true },
			standardAttributes: {
				email: { required: true, mutable: true },
			},
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		const userPoolClient = new cognito.UserPoolClient(
			this,
			"AuthlyUserPoolClient",
			{
				userPool,
				generateSecret: false,
				authFlows: {
					userPassword: true,
					userSrp: true,
				},
				preventUserExistenceErrors: true,
			},
		);

		const envPrefix = (globalThis as any).process?.env?.COGNITO_DOMAIN_PREFIX;
		const domainPrefix = props?.domainPrefix ?? envPrefix ?? "authly-default";

		userPool.addDomain("CognitoDomain", {
			cognitoDomain: { domainPrefix },
		});

		new cdk.CfnOutput(this, "CognitoUserPoolId", {
			value: userPool.userPoolId,
			description: "Cognito User Pool Id for Authly",
			exportName: "AuthlyUserPoolId",
		});

		new cdk.CfnOutput(this, "CognitoUserPoolClientId", {
			value: userPoolClient.userPoolClientId,
			description: "Cognito User Pool Client Id for Authly",
			exportName: "AuthlyUserPoolClientId",
		});

		new cdk.CfnOutput(this, "Region", {
			value: this.region,
			description: "AWS Region where the stack is deployed",
			exportName: "AuthlyCognitoRegion",
		});
	}
}
