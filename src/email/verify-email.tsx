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

interface EmailVerificationProps {
	userName: string;
	verificationUrl: string;

	expiryText?: string;
}

const EmailVerification = (props: EmailVerificationProps) => {
	const { userName, verificationUrl, expiryText } = props;
    const logoUrl = 'https://authly-red.vercel.app/authly_logo.png';
	return (
		<Html lang="en" dir="ltr">
			<Tailwind>
				<Head />
				<Preview>Verify your email to activate your Authly account</Preview>

				<Hr className="my-[16px]" />

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
								Welcome to Authly! {userName.toUpperCase()},
							</Heading>

							<Text className="text-[#020304] text-[16px] leading-[24px] mb-[32px] m-0">
								To complete your account setup and start leveraging our
								AI-powered lending solutions, please verify your email address
								by clicking the button below:
							</Text>

							{/* Verification Button */}
							<Section className="text-center mb-[32px]">
								<Button
									href={verificationUrl}
									className="bg-[#3A98D0] text-white text-[14px] font-semibold py-[10px] px-[22px] rounded-[4px] no-underline box-border inline-block"
								>
									Verify Email Address
								</Button>
							</Section>

							<Text className="text-[#020304] text-[14px] leading-[20px] mb-[16px] m-0">
								If the button above doesn&apos;t work, you can also verify your
								email by copying and pasting this link into your browser:
							</Text>

							<Text className="text-[#3A98D0] text-[14px] leading-[20px] mb-[24px] m-0 break-all">
								{props.verificationUrl}
							</Text>

							<Text className="text-[#020304] text-[14px] leading-[20px] mb-[16px] m-0">
								This verification link will expire in {expiryText ?? "5 mins"} for security
								purposes.
							</Text>

							<Text className="text-[#020304] text-[16px] leading-[24px] mb-[0px] m-0">
								If you didn&apos;t create an account with Authly, please ignore
								this email or contact our support team.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};
export default EmailVerification;
