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

interface WelcomeEmailProps {
  userEmail?: string;
  verifyUrl?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ userEmail, verifyUrl }) => (
  <Html>
    <Head />
    <Preview>Welcome to Authly!</Preview>
    <Tailwind config={pixelBasedPreset}>
      <Body className="bg-gray-50 font-sans text-gray-900">
        <Section className="py-8">
          <Container className="bg-white rounded-lg shadow p-6 mx-auto max-w-xl">
            <Heading className="text-lg font-semibold">Welcome to Authly!</Heading>

            <Text className="mt-4 text-base leading-6">
              {userEmail ? (
                <>Hi <strong>{userEmail}</strong>,</>
              ) : (
                <>Hello,</>
              )}
            </Text>

            <Text className="mt-4 text-sm">Thank you for signing up. We&apos;re excited to have you on board.</Text>

            {verifyUrl && (
              <Section className="mt-6">
                <Text className="mb-2">To get started, please verify your email address by clicking the button below:</Text>
                <Button href={verifyUrl} className="bg-green-600 text-white px-5 py-3 rounded-md font-medium text-sm">Verify Email</Button>
              </Section>
            )}

            <Text className="mt-6">If you have any questions, just reply to this email—we&apos;re here to help!</Text>

            <hr className="my-6 border-t border-gray-200" />

            <Text className="text-xs text-gray-500">Welcome aboard,<br />The Authly Team</Text>
          </Container>
        </Section>
      </Body>
    </Tailwind>
  </Html>
);

export default WelcomeEmail;
