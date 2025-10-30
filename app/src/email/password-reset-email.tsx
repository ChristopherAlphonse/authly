import * as React from "react";

interface PasswordResetEmailProps {
  resetUrl: string;
  userEmail?: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({ resetUrl, userEmail }) => (
  <div style={{ fontFamily: 'sans-serif', color: '#222', background: '#f9f9f9', padding: 24 }}>
    <h2>Password Reset Request</h2>
    <p>
      {userEmail ? (
        <>Hi <b>{userEmail}</b>,</>
      ) : (
        <>Hello,</>
      )}
    </p>
    <p>
      We received a request to reset your password. Click the button below to set a new password:
    </p>
    <p>
      <a
        href={resetUrl}
        style={{
          display: 'inline-block',
          background: '#2563eb',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 6,
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Reset Password
      </a>
    </p>
    <p>If you did not request this, you can safely ignore this email.</p>
    <p style={{ color: '#888', fontSize: 12 }}>This link will expire after a short period for your security.</p>
    <hr style={{ margin: '32px 0', border: 0, borderTop: '1px solid #eee' }} />
    <p style={{ fontSize: 12, color: '#888' }}>
      If you have any questions, contact support.
    </p>
  </div>
);
