import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

interface WelcomeEmailProps {
  email: string;
}

export const WelcomeEmail = ({
  email = 'subscriber@example.com',
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the Clan! You're officially subscribed to Original Tobey Studio updates.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Original Tobey Studio</Heading>
          </Section>

          {/* Welcome Body */}
          <Section style={section}>
            <Heading style={welcomeHeading}>Welcome to the Clan!</Heading>
            <Text style={text}>
              Hi there,
            </Text>
            <Text style={text}>
              Thank you for subscribing to the Original Tobey Studio newsletter. We're thrilled to have you join our community of warriors and creators.
            </Text>
            <Text style={text}>
              From now on, you'll be the first to receive updates on:
            </Text>
            <ul style={list}>
              <li style={listItem}>🔥 <strong>Exclusive Drops</strong> — Early access to legendary limited-edition merchandise.</li>
              <li style={listItem}>🎁 <strong>Special Offers</strong> — Members-only discount codes and seasonal sales.</li>
              <li style={listItem}>⚔️ <strong>Inside Look</strong> — Sneak peeks at new designs, styling guides, and brand updates.</li>
            </ul>
            <Text style={text}>
              Your subscription is registered under: <strong style={highlightText}>{email}</strong>.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={textCenter}>
              Ready to gear up? Explore the shop now.
            </Text>
            <div style={btnWrapper}>
              <a href="https://tobeystudio.com" target="_blank" rel="noopener noreferrer" style={button}>
                Visit the Store
              </a>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              If you received this email by mistake or wish to unsubscribe, you can manage your preferences at any time.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Original Tobey Studio. All Rights Reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#0d0d0d', // Sleek dark background
  color: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#1a1a1a',
  margin: '40px auto',
  padding: '0 0 48px',
  borderRadius: '12px',
  border: '1px solid #2d2d2d',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  backgroundColor: '#dc2626', // Vibrant theme red
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  margin: '0',
  fontSize: '26px',
  fontWeight: '900',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
};

const section = {
  padding: '32px 32px 16px',
};

const welcomeHeading = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#cccccc',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const list = {
  paddingLeft: '20px',
  margin: '20px 0',
};

const listItem = {
  color: '#cccccc',
  fontSize: '15px',
  lineHeight: '24px',
  marginBottom: '12px',
};

const highlightText = {
  color: '#dc2626',
};

const divider = {
  borderTop: '1px solid #2d2d2d',
  margin: '0',
};

const ctaSection = {
  padding: '32px',
  textAlign: 'center' as const,
};

const textCenter = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const btnWrapper = {
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#dc2626',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  display: 'inline-block',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)',
};

const footer = {
  padding: '32px 24px 0',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 8px',
};

export default WelcomeEmail;
