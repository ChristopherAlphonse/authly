import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";
import * as React from "react";

interface MagicLinkProps {
	userEmail: string;
	magicLinkUrl: string;
	expiryText?: string;
}

const MagicLink = (props: MagicLinkProps) => {
	const { userEmail, magicLinkUrl, expiryText } = props;


	return (
		<Html lang="en" dir="ltr">
			<Tailwind>
				<Head />
				<Preview>Sign in to your Authly account</Preview>
				<Hr className="my-[16px]" />
				<Body className="bg-[#F6F8FA] font-sans py-[40px]">
					<Container className="bg-[#FFFFFF] rounded-[8px] max-w-[600px] mx-auto px-[40px] py-[40px]">
						<Hr className="my-[16px] " />

                        {/* Main Content */}
						<Section className="mb-[32px]">

                            <Heading className="text-[#020304] text-[16px] leading-[24px] mb-[24px] m-0">
								Sign in to your account
							</Heading>

							<Text className="text-[#020304] text-[16px] leading-[24px] mb-[32px] m-0">
								We received a request to sign in to your Authly account
								associated with <strong>{userEmail}</strong>. Click the button
								below to sign in securely without a password.
							</Text>
							{/* Magic Link Button */}
							<Section className="text-center mb-[32px]">
								<Button
									href={magicLinkUrl}
									className="bg-[#3A98D0] text-white text-[14px] font-semibold py-[10px] px-[22px] rounded-[4px] no-underline box-border inline-block"
								>
									Sign In
								</Button>
							</Section>

							<Text className="text-[#020304] text-[14px] leading-[20px] mb-[16px] m-0">
								If the button above doesn&apos;t work, you can also sign in by
								copying and pasting this link into your browser:
							</Text>

							<Text className="text-[#3A98D0] text-[14px] leading-[20px] mb-[24px] m-0 break-all">
								{magicLinkUrl}
							</Text>

							<Text className="text-[#020304] text-[14px] leading-[20px] mb-[16px] m-0">
								This link will expire in {expiryText ?? "10 minutes"} for
								security purposes. If you didn&apos;t request this sign-in link,
								you can safely ignore this email.
							</Text>
						</Section>

						<Hr className="my-[16px]" />

						{/* Footer */}
						<Section className="text-center">
							<Text className="text-[#6B7280] text-[12px] leading-[16px] m-0">
								© {new Date().getFullYear()} Authly. All rights reserved.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default MagicLink;
