import * as React from "react";

interface WelcomeEmailProps {
  userEmail?: string;
  verifyUrl?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ userEmail, verifyUrl }) => (
  <div style={{ fontFamily: 'sans-serif', color: '#222', background: '#f9f9f9', padding: 24 }}>
    <h2>Welcome to Authly!</h2>
    <p>
      {userEmail ? (
        <>Hi <b>{userEmail}</b>,</>
      ) : (
        <>Hello,</>
      )}
    </p>
    <p>
      Thank you for signing up. We're excited to have you on board.
    </p>
    {verifyUrl && (
      <>
        <p>To get started, please verify your email address by clicking the button below:</p>
        <p>
          <a
            href={verifyUrl}
            style={{
              display: 'inline-block',
              background: '#22c55e',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Verify Email
          </a>
        </p>
      </>
    )}
    <p>If you have any questions, just reply to this email—we're here to help!</p>
    <hr style={{ margin: '32px 0', border: 0, borderTop: '1px solid #eee' }} />
    <p style={{ fontSize: 12, color: '#888' }}>
      Welcome aboard,<br />The Authly Team
    </p>
  </div>
);
