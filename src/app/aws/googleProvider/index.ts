import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export type GoogleProviderProps = {
	userPool: cognito.IUserPool;
	userPoolClient: cognito.IUserPoolClient;
	clientId: string;
	clientSecret: string;
};

/**
 * Google OAuth 2.0 OIDC Provider for AWS Cognito
 * Uses Google's standard OIDC endpoints
 */
export class GoogleProvider extends Construct {
	public provider: cognito.UserPoolIdentityProviderOidc;

	constructor(scope: Construct, id: string, props: GoogleProviderProps) {
		super(scope, id);

		// Create Google OIDC Identity Provider
		const googleIdentityProvider = new cognito.UserPoolIdentityProviderOidc(
			this,
			"GoogleProvider",
			{
				clientId: props.clientId,
				clientSecret: props.clientSecret,
				userPool: props.userPool,
				issuerUrl: "https://accounts.google.com",
				attributeRequestMethod: cognito.OidcAttributeRequestMethod.GET,
				name: "Google",
				scopes: ["openid", "email", "profile"],
				attributeMapping: {
					email: cognito.ProviderAttribute.GOOGLE_EMAIL,
					givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
					familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
					profilePicture: cognito.ProviderAttribute.GOOGLE_PICTURE,
					preferredUsername: cognito.ProviderAttribute.GOOGLE_NAME,
				},
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

