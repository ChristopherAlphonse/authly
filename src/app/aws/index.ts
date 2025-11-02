import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";

import type { Construct } from "constructs";
import { GitHubProvider } from "./ghProvider";
import { GoogleProvider } from "./googleProvider";
import dotenv from "dotenv";
import path from "node:path";

// Load .env file from project root (works regardless of cwd)
// The .env file is expected to live at the repository root.
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
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
				generateSecret: true,
				authFlows: {
					userPassword: true,
					userSrp: true,
				},
				oAuth: {
					flows: {
						authorizationCodeGrant: true,
					},
					scopes: [
						cognito.OAuthScope.OPENID,
						cognito.OAuthScope.EMAIL,
						cognito.OAuthScope.PROFILE,
					],
				callbackUrls: [
					"http://localhost:5173/api/auth/callback/cognito",
					...(process.env.BETTER_AUTH_URL
						? [`${process.env.BETTER_AUTH_URL}/api/auth/callback/cognito`]
						: []),
				],
				},
				preventUserExistenceErrors: true,
			},
		);

		const envPrefix = process.env.COGNITO_DOMAIN_PREFIX;
		const domainPrefix = props?.domainPrefix ?? envPrefix ?? "authly-default";

		const domain = userPool.addDomain("CognitoDomain", {
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

		new cdk.CfnOutput(this, "CognitoDomain", {
			value: `${domainPrefix}.auth.${this.region}.amazoncognito.com`,
			description: "Cognito Hosted UI Domain",
			exportName: "AuthlyCognitoDomain",
		});

		// Only add GitHub provider if credentials are provided
		if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
			new GitHubProvider(this, "GitHubProvider", {
				clientId: process.env.GITHUB_CLIENT_ID,
				clientSecret: process.env.GITHUB_CLIENT_SECRET,
				userPool,
				userPoolClient,
				domain,
			});
		}

		// Only add Google provider if credentials are provided
		if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
			new GoogleProvider(this, "GoogleProvider", {
				clientId: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				userPool,
				userPoolClient,
			});
		}
	}
}
