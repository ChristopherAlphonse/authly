import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import type { SendEmailCommandInput } from "@aws-sdk/client-ses";
import { render } from "@react-email/render";
import React from "react";
import { PasswordResetEmail } from "./password-reset-email";
import { WelcomeEmail } from "./welcome-email";

const REGION = process.env.AWS_REGION || process.env.AWS_SES_REGION || "us-east-1";
const FROM = process.env.SES_FROM_ADDRESS || process.env.AWS_SES_FROM || "";

const ses = new SESClient({
  region: REGION,
  // credentials: rely on SDK defaults (ENV, IAM role). If you must provide keys, set them in env vars.
});

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendRenderedEmail({ to, subject, html, text }: SendArgs) {
  if (!FROM) throw new Error("SES from address not configured (SES_FROM_ADDRESS)");
  const params: SendEmailCommandInput = {
    Destination: { ToAddresses: [to] },
    Message: {
      Body: {
        Html: { Data: html, Charset: "UTF-8" },
        ...(text ? { Text: { Data: text, Charset: "UTF-8" } } : {}),
      },
      Subject: { Data: subject, Charset: "UTF-8" },
    },
    Source: FROM,
  };

  await ses.send(new SendEmailCommand(params));
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, userEmail?: string) {
  const html = await render(<PasswordResetEmail resetUrl={resetUrl} userEmail={userEmail} />);
  return sendRenderedEmail({ to, subject: "Reset your Authly password", html });
}

export async function sendWelcomeEmail(to: string, verifyUrl?: string, userEmail?: string) {
  const html = await render(<WelcomeEmail verifyUrl={verifyUrl} userEmail={userEmail} />);
  return sendRenderedEmail({ to, subject: "Welcome to Authly!", html });
}

const awsSes = {
  sendRenderedEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};

export default awsSes;
