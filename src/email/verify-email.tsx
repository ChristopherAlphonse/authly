import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,Hr ,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';

interface EmailVerificationProps {
  userName: string;
  verificationUrl: string;
}


const EmailVerification = (props:EmailVerificationProps) => {
  const { userName, verificationUrl  } = props;

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
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/cb5b47f3-c6d5-4218-9d64-025bb9df4562/primary/f72511e4-84dd-4c60-b0c9-8d923de8836d.png"
                alt="Authly"
                className="w-full h-auto max-w-[200px] mx-auto"
              />
            </Section>

  <Hr className="my-[16px] " />

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Heading className="text-[#020304] text-[24px] font-bold text-center mb-[16px] m-0">
                Verify Your Email Address {userName},
              </Heading>


              
              <Text className="text-[#020304] text-[16px] leading-[24px] mb-[24px] m-0">
                Welcome to Authly! We're excited to help you transform document chaos into actionable lending intelligence.
              </Text>
              
              <Text className="text-[#020304] text-[16px] leading-[24px] mb-[32px] m-0">
                To complete your account setup and start leveraging our AI-powered lending solutions, please verify your email address by clicking the button below:
              </Text>

              {/* Verification Button */}
              <Section className="text-center mb-[32px]">
                <Button
                  href={verificationUrl}
                  className="bg-[#3A98D0] text-white text-[16px] font-semibold py-[12px] px-[24px] rounded-[6px] no-underline box-border inline-block"
                >
                  Verify Email Address
                </Button>
              </Section>

              <Text className="text-[#020304] text-[14px] leading-[20px] mb-[16px] m-0">
                If the button above doesn't work, you can also verify your email by copying and pasting this link into your browser:
              </Text>
              
              <Text className="text-[#3A98D0] text-[14px] leading-[20px] mb-[24px] m-0 break-all">
                {props.verificationUrl}
              </Text>

              <Text className="text-[#020304] text-[14px] leading-[20px] mb-[16px] m-0">
                This verification link will expire in 1 hour for security purposes.
              </Text>

              <Text className="text-[#020304] text-[16px] leading-[24px] mb-[0px] m-0">
                If you didn't create an account with Authly, please ignore this email or contact our support team.
              </Text>
            </Section>

           
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
export default EmailVerification;
