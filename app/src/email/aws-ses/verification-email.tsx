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

interface VerificationEmailProps {
  verifyUrl: string;
  userEmail?: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({ verifyUrl, userEmail }) => (
  <Html>
    <Head />
    <Preview>Verify your Authly email</Preview>
    <Tailwind config={pixelBasedPreset}>
      <Body className="bg-gray-50 font-sans text-gray-900">
        <Section className="py-8">
          <Container className="bg-white rounded-lg shadow p-6 mx-auto max-w-xl">
            <Heading className="text-lg font-semibold">Verify your email</Heading>

            <Text className="mt-4 text-base leading-6">
              {userEmail ? (
                <>Hi <strong>{userEmail}</strong>,</>
              ) : (
                <>Hello,</>
              )}
            </Text>

            <Text className="mt-4 text-sm">
              Please verify your email address by clicking the button below. This helps us keep your account secure.
            </Text>

            <Section className="mt-6">
              <Button href={verifyUrl} className="bg-blue-600 text-white px-5 py-3 rounded-md font-medium text-sm">
                Verify Email
              </Button>
            </Section>

            <Text className="mt-6 text-xs text-gray-500">If you didn&apos;t create an account, you can ignore this email.</Text>

            <hr className="my-6 border-t border-gray-200" />

            <Text className="text-xs text-gray-500">Questions? Reply to this email and we&apos;ll help.</Text>
          </Container>
        </Section>
      </Body>
    </Tailwind>
  </Html>
);

export default VerificationEmail;
