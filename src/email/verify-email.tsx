import * as React from 'react';

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

import { EmailFooter } from './email-footer';

interface EmailVerificationProps {
  userName: string;
  verificationUrl: string;
}

const EmailVerification = (props:EmailVerificationProps) => {
  const { userName, verificationUrl  } = props;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Please verify your email address to complete your registration</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] px-[32px] py-[40px] max-w-[600px] mx-auto">
            <Section>
              <Heading className="text-[28px] font-bold text-gray-900 mb-[24px] text-center">
                Verify Your Email Address
              </Heading>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                Hi there! {userName},
              </Text>

                <Text className="text-[14px] text-gray-600 mb-[16px] leading-[20px]">
               Thanks for signing up. To complete your registration and start using your account,
                please verify your email address by clicking the button below.
              </Text>

              <Section className="text-center mb-[32px]">
                <Button
                  href={verificationUrl}
                  className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border"
                >
                  Verify Email Address
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-600 mb-[16px] leading-[20px]">
                If the button doesn&apos;t work, you can copy and paste this link into your browser:
              </Text>

              <Text className="text-[14px] text-blue-600 mb-[32px] break-all">
                <Link href={verificationUrl} className="text-blue-600 no-underline">
                  {verificationUrl}
                </Link>
              </Text>


            </Section>

            <EmailFooter />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};



export default EmailVerification;
