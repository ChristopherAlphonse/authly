import * as React from "react";

import {
	Body,
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

interface LoginNotificationProps {
	userName: string;
	userEmail: string;
	ipAddress: string;
	location: string;
	userAgent: string;
	loginTime: string;
}

const LoginNotification = (props: LoginNotificationProps) => {
	const { userName, userEmail, ipAddress, location, userAgent, loginTime } = props;

	return (
		<Html lang="en" dir="ltr">
			<Tailwind>
				<Head />
				<Preview>New sign-in detected on your Authly account</Preview>
				<Body className="bg-[#F6F8FA] font-sans py-[40px]">
					<Container className="bg-[#FFFFFF] rounded-[8px] max-w-[600px] mx-auto px-[40px] py-[40px]">
						{/* Header */}
						<Section className="mb-[32px]">
							<Heading className="text-[#020304] text-[24px] font-bold leading-[32px] mb-[24px ] py-[40px]m-0">
								New Sign-In Detected
							</Heading>

							<Text className="text-[#020304] text-[16px] leading-[24px] mb-[16px] m-0 py-[20px]">
								Hello {userName || userEmail},
							</Text>

							<Text className="text-[#020304] text-[16px] leading-[24px] mb-[32px] m-0">
								We detected a new sign-in to your Authly account. If this was you,
								no action is needed. If you don&apos;t recognize this activity,
								please secure your account immediately.
							</Text>
						</Section>

						{/* Login Details Box */}
						<Section className="mb-[32px] p-[24px] bg-[#F8F9FA] rounded-[8px] border border-solid border-[#E5E7EB]">
							<Text className="text-[#020304] text-[16px] font-bold mb-[20px] m-0">
								Sign-In Details:
							</Text>
							<Text className="text-[#374151] text-[14px] leading-[20px] mb-[12px] m-0">
								<strong className="text-[#020304]">Time:</strong> {loginTime}
							</Text>
							<Text className="text-[#374151] text-[14px] leading-[20px] mb-[12px] m-0">
								<strong className="text-[#020304]">IP Address:</strong> {ipAddress}
							</Text>
							<Text className="text-[#374151] text-[14px] leading-[20px] mb-[12px] m-0">
								<strong className="text-[#020304]">Location:</strong> {location}
							</Text>
							<Text className="text-[#374151] text-[14px] leading-[20px] m-0">
								<strong className="text-[#020304]">Device:</strong> {userAgent}
							</Text>
						</Section>

						<Hr className="border-[#E5E7EB] border-solid my-[32px]" />

						{/* Security Notice */}
						<Section className="mb-[32px] p-[20px] bg-[#FEF3C7] rounded-[8px] border border-solid border-[#F59E0B]">
							<Text className="text-[#92400E] text-[14px] leading-[20px] m-0">
								<strong>Security Tip:</strong> If you didn&apos;t sign in, please
								contact our support team.
							</Text>
						</Section>

						{/* Closing */}
						<Section>
							<Text className="text-[#020304] text-[16px] leading-[24px] m-0">
								Stay secure,
								<br />
								<strong>The Authly Security Team</strong>
							</Text>
						</Section>


					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};



export default LoginNotification;
