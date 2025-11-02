import * as path from "node:path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export type GitHubProviderProps = {
	userPool: cognito.IUserPool;
	userPoolClient: cognito.IUserPoolClient;
	domain: cognito.UserPoolDomain;
	clientId: string;
	clientSecret: string;
};

// Githubprovider OIDC
// API Gateway
// Lambda Functions
export class GitHubProvider extends Construct {
	public api: apigateway.RestApi;
	public apiUrl: string;
	public provider: cognito.UserPoolIdentityProviderOidc;

	constructor(scope: Construct, id: string, props: GitHubProviderProps) {
		super(scope, id);

		// Resolve lambda paths relative to this file's directory
		const lambdaDir = path.resolve(__dirname, "..", "lambda");

		// Common bundling options to fix esbuild 0.22+ breaking change
		const bundlingOptions = {
			esbuildArgs: {
				"--packages": "bundle",
			},
		};

		const userLambda = new lambda.NodejsFunction(this, "UserLambda", {
			entry: path.join(lambdaDir, "user.ts"),
			handler: "handler",
			runtime: Runtime.NODEJS_18_X,
			bundling: bundlingOptions,
		});

		const tokenLambda = new lambda.NodejsFunction(this, "TokenLambda", {
			entry: path.join(lambdaDir, "token.ts"),
			handler: "handler",
			runtime: Runtime.NODEJS_18_X,
			bundling: bundlingOptions,
		});

		const privateLambda = new lambda.NodejsFunction(this, "PrivateLambda", {
			entry: path.join(lambdaDir, "private.ts"),
			handler: "handler",
			runtime: Runtime.NODEJS_18_X,
			bundling: bundlingOptions,
		});

		const apiGithubGateway = new apigateway.RestApi(this, "APIGateway", {
			restApiName: "GitHub API Gateway",
			description: "this is for GitHub API Login",
			deployOptions: {
				stageName: "prod",
			},
			defaultCorsPreflightOptions: {
				allowOrigins: apigateway.Cors.ALL_ORIGINS,
				allowMethods: apigateway.Cors.ALL_METHODS,
				allowHeaders: [
					"Content-Type",
					"Authorization",
					"X-Amz-Date",
					"X-Api-Key",
					"X-Amz-Security-Token",
					"Accept",
				],
			},
			endpointConfiguration: {
				types: [apigateway.EndpointType.REGIONAL],
			},
		});

		const userResource = apiGithubGateway.root.addResource("user");
		const userIntegration = new apigateway.LambdaIntegration(userLambda);
		userResource.addMethod("GET", userIntegration);

		const tokenResource = apiGithubGateway.root.addResource("token");
		const tokenIntegration = new apigateway.LambdaIntegration(tokenLambda);
		tokenResource.addMethod("POST", tokenIntegration);

		const userPoolAuthorizer = new apigateway.CfnAuthorizer(
			this,
			"UserPoolAuthorizerGithub",
			{
				name: "UserPoolAuthorizer",
				restApiId: apiGithubGateway.restApiId,
				type: "COGNITO_USER_POOLS",
				providerArns: [props.userPool.userPoolArn],
				identitySource: "method.request.header.Authorization",
			},
		);

		const privateResource = apiGithubGateway.root.addResource("private");
		const privateIntegration = new apigateway.LambdaIntegration(privateLambda);
		privateResource.addMethod("GET", privateIntegration, {
			authorizer: { authorizerId: userPoolAuthorizer.ref },
			authorizationType: apigateway.AuthorizationType.COGNITO,
		});

		const githubIdentityProvider = new cognito.UserPoolIdentityProviderOidc(
			this,
			"GitHubProvider",
			{
				clientId: props.clientId,
				clientSecret: props.clientSecret,
				userPool: props.userPool,
				issuerUrl: "https://github.com",
				attributeRequestMethod: cognito.OidcAttributeRequestMethod.GET,
				name: "GitHub",
				endpoints: {
					authorization: "https://github.com/login/oauth/authorize",
					jwksUri: `${apiGithubGateway.url}token`,
					token: `${apiGithubGateway.url}token`,
					userInfo: `${apiGithubGateway.url}user`,
				},
				attributeMapping: {
					email: cognito.ProviderAttribute.other("email"),
					preferredUsername: cognito.ProviderAttribute.other("name"),
					profilePicture: cognito.ProviderAttribute.other("avatar_url"),
				},
				scopes: ["openid", "email", "profile"],
			},
		);

		const userPoolClient = props.userPoolClient.node
			.defaultChild as cognito.CfnUserPoolClient;
		userPoolClient.supportedIdentityProviders = [
			...(userPoolClient.supportedIdentityProviders || []),
			githubIdentityProvider.providerName,
		];
		this.api = apiGithubGateway;
		this.apiUrl = apiGithubGateway.url;
		this.provider = githubIdentityProvider;
	}
}
