import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";

interface PasswordResetEmailProps {
  resetUrl: string;
  userEmail?: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({ resetUrl, userEmail }) => (
  <Html>
    <Head />
    <Preview>Password reset instructions</Preview>
    <Tailwind config={pixelBasedPreset}>
      <Body className="bg-gray-50 font-sans text-gray-900">
        <Section className="py-8">
          <Container className="bg-white rounded-lg shadow p-6 mx-auto max-w-xl">
            <Heading className="text-lg font-semibold">Password Reset Request</Heading>

            <Text className="mt-4 text-base leading-6">
              {userEmail ? (
                <>Hi <strong>{userEmail}</strong>,</>
              ) : (
                <>Hello,</>
              )}
            </Text>

            <Text className="mt-4 text-sm leading-6">
              We received a request to reset your password. Click the button below to set a new password.
            </Text>

            <Section className="mt-6">
              <Button
                href={resetUrl}
                className="bg-blue-600 text-white px-5 py-3 rounded-md font-medium text-sm"
              >
                Reset Password
              </Button>
            </Section>

            <Text className="mt-6 text-xs text-gray-500">
              If you did not request this, you can safely ignore this email. This link will expire shortly for your security.
            </Text>

            <hr className="my-6 border-t border-gray-200" />

            <Text className="text-xs text-gray-500">If you have any questions, contact support.</Text>
          </Container>
        </Section>
      </Body>
    </Tailwind>
  </Html>
);

export default PasswordResetEmail;
