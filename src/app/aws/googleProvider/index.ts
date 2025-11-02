import * as cognito from "aws-cdk-lib/aws-cognito";

import { Construct } from "constructs";

export type GoogleProviderProps = {
	userPool: cognito.IUserPool;
	userPoolClient: cognito.IUserPoolClient;
	clientId: string;
	clientSecret: string;
};

/**
 * Google OAuth 2.0 Provider for AWS Cognito
 * Uses Cognito's built-in Google provider (not OIDC)
 */
export class GoogleProvider extends Construct {
	public provider: cognito.UserPoolIdentityProviderGoogle;

	constructor(scope: Construct, id: string, props: GoogleProviderProps) {
		super(scope, id);

		// Create Google Identity Provider using Cognito's built-in Google provider
		const googleIdentityProvider = new cognito.UserPoolIdentityProviderGoogle(
			this,
			"GoogleProvider",
			{
				clientId: props.clientId,
				clientSecret: props.clientSecret,
				userPool: props.userPool,
				attributeMapping: {
					email: cognito.ProviderAttribute.GOOGLE_EMAIL,
					givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
					familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
					profilePicture: cognito.ProviderAttribute.GOOGLE_PICTURE,
					preferredUsername: cognito.ProviderAttribute.GOOGLE_NAME,
				},
				scopes: ["openid", "email", "profile"],
			},
		);

		// Add Google as a supported identity provider to the user pool client
		const userPoolClient = props.userPoolClient.node
			.defaultChild as cognito.CfnUserPoolClient;
		userPoolClient.supportedIdentityProviders = [
			...(userPoolClient.supportedIdentityProviders || []),
			googleIdentityProvider.providerName,
		];

		this.provider = googleIdentityProvider;
	}
}

