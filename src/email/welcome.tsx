import * as React from "react";

import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Preview,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";

interface WelcomeEmailProps {
	userName: string;
	userEmail: string;
}

const WelcomeEmail = (props: WelcomeEmailProps) => {
	const { userName, userEmail } = props;
	const logoUrl = "https://authly-red.vercel.app/authly_logo.png";
	return (
		<Html lang="en" dir="ltr">
			<Tailwind>
				<Head />
				<Preview>Welcome to Authly!</Preview>
				<Body className="bg-[#F6F8FA] font-sans py-[40px]">
					<Container className="bg-[#FFFFFF] rounded-[8px] max-w-[600px] mx-auto px-[40px] py-[40px]">
						{/* Header with Logo */}
						<Section className="text-center mb-[32px]">
							<Img
								src={logoUrl}
								alt="Authly"
								className="w-full h-auto max-w-[200px] mx-auto"
							/>
						</Section>

						<Hr className="my-[16px] " />

						{/* Main Content */}
						<Section className="mb-[32px]">
							<Heading className="text-[#020304] text-[16px] leading-[24px] mb-[24px] m-0">
								Welcome to Authly, {userName || userEmail}!
							</Heading>

							<Text className="text-[#020304] text-[16px] leading-[24px] mb-[32px] m-0">
								Thank you for joining Authly! We&apos;re excited to have you on
								board. Your account has been successfully created and you&apos;re
								all set to get started.
							</Text>

							<Text className="text-[#020304] text-[16px] leading-[24px] mb-[32px] m-0">
								Here&apos;s what you can do next:
							</Text>

							<Section className="mb-[32px]">
								<Text className="text-[#020304] text-[14px] leading-[20px] mb-[16px] m-0">
									✓ Verify your email address to secure your account
								</Text>
								<Text className="text-[#020304] text-[14px] leading-[20px] mb-[16px] m-0">
									✓ Set up a passkey for faster, passwordless authentication
								</Text>
								<Text className="text-[#020304] text-[14px] leading-[20px] mb-[16px] m-0">
									✓ Explore our AI-powered lending solutions
								</Text>
							</Section>

							<Text className="text-[#020304] text-[16px] leading-[24px] mb-[32px] m-0">
								If you have any questions or need assistance, our support team is
								here to help. Just reply to this email or visit our help center.
							</Text>

							<Text className="text-[#020304] text-[16px] leading-[24px] mb-[0px] m-0">
								Welcome aboard!
							</Text>

							<Text className="text-[#020304] text-[14px] leading-[20px] mb-[0px] mt-[24px] m-0">
								Best regards,
								<br />
								The Authly Team
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};
export default WelcomeEmail;

