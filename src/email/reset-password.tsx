import * as React from "react";

import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";

interface PasswordResetProps {
	userEmail: string;
	resetUrl: string;
	expiryText?: string;
}

const PasswordReset = (props: PasswordResetProps) => {
	const { resetUrl, userEmail, expiryText } = props;
	const logoUrl = 'https://authly-red.vercel.app/authly_logo.png';
	return (
		<Html lang="en" dir="ltr">
			<Head />
			<Preview>Reset your Authly password</Preview>
			<Tailwind>
				<Body className="bg-[#F6F8FA] font-sans py-[40px]">
					<Container className="bg-[#FFFFFF] rounded-[8px] mx-auto p-[40px] max-w-[600px]">
						{/* Logo */}
						<Section className="text-center mb-[32px]">
							<Img
								src={logoUrl}
								alt="Authly"
								className="w-[120px] h-auto mx-auto"
							/>
						</Section>

						{/* Main Content */}
						<Section>
							<Heading className="text-[#020304] text-[24px] font-bold mb-[16px] text-center">
								Reset Your Password
							</Heading>

							<Text className="text-[#020304] text-[16px] leading-[24px] mb-[24px]">
								We received a request to reset the password for your Authly
								account associated with.
                                {/* */}
                                <strong> {userEmail} </strong>
							</Text>

							<Text className="text-[#020304] text-[16px] leading-[24px] mb-[32px]">
								Click the button below to create a new password. This link will
								expire in {expiryText ?? "5 minutes"} for security purposes.
							</Text>

							{/* Reset Button */}
							<Section className="text-center mb-[32px]">
								<Button
									href={resetUrl}
									className="bg-[#3A98D0] text-white px-[30px] py-[12px] rounded-[4px] text-[16px] font-medium no-underline box-border"
								>
									Reset Password
								</Button>
							</Section>

							<Text className="text-[#020304] text-[14px] leading-[20px] mb-[16px]">
								If the button doesn&apos;t work, copy and paste this link into
								your browser:
							</Text>

							<Text className="text-[#3A98D0] text-[14px] leading-[20px] mb-[24px] break-all">
								<Link href={resetUrl} className="text-[#3A98D0] underline">
									{resetUrl}
								</Link>
							</Text>

							<Text className="text-[#020304] text-[14px] leading-[20px] mb-[16px]">
								If you didn&apos;t request a password reset, you can safely
								ignore this email. Your password will remain unchanged.
							</Text>

							<Text className="text-[#020304] text-[14px] leading-[20px]">
								For security questions or assistance, contact our support team.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default PasswordReset;
