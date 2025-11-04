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

interface PasswordResetProps {

  resetUrl: string;
}

const PasswordReset = (props:PasswordResetProps) => {
const { resetUrl } = props;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Reset your password - secure link inside</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] px-[32px] py-[40px] max-w-[600px] mx-auto">
            <Section>
              <Heading className="text-[28px] font-bold text-gray-900 mb-[24px] text-center">
                Reset Your Password
              </Heading>



              <Text className="text-[16px] text-gray-700 mb-[32px] leading-[24px]">
                Click the button below to create a new password:
              </Text>

              <Section className="text-center mb-[32px]">
                <Button
                  href={resetUrl}
                  className="bg-red-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border"
                >
                  Reset Password
                </Button>
              </Section>


              <Text className="text-[14px] text-blue-600 mb-[32px] break-all">
                <Link href={resetUrl} className="text-blue-600 no-underline">
                  {resetUrl}
                </Link>
              </Text>

              <Section className="bg-yellow-50 border border-yellow-200 rounded-[8px] p-[16px] mb-[24px]">
                <Text className="text-[14px] text-yellow-800 m-0 leading-[20px]">
                  <strong>Security Notice:</strong> This password reset link will expire in 1 hour for your security.
                  If you didn't request this password reset, please ignore this email or contact our support team.
                </Text>
              </Section>

              <Text className="text-[14px] text-gray-600 leading-[20px]">
                For your account security, never share this link with anyone. If you continue to have trouble,
                please contact our support team for assistance.
              </Text>
            </Section>

          <EmailFooter />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};


export default PasswordReset;
