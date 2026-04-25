import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

interface ReceiptEmailProps {
  orderId: string;
  customerName: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export const ReceiptEmail = ({
  orderId = 'ORD-0000',
  customerName = 'Customer',
  totalAmount = 0,
  items = [],
}: ReceiptEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Original Tobey Studio Order Receipt (#{orderId})</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Original Tobey Studio</Heading>
          </Section>

          {/* Intro */}
          <Section style={section}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Thank you for your purchase! We're getting your order ready for delivery. 
              Below is a summary of your receipt.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Order Details */}
          <Section style={section}>
            <Text style={boldText}>Order ID: <span style={normalText}>{orderId}</span></Text>
            
            <Heading as="h3" style={itemHeading}>Items Ordered:</Heading>
            {items.map((item, index) => (
              <Text key={index} style={itemText}>
                {item.quantity}x {item.name} - ${(item.price * item.quantity).toFixed(2)}
              </Text>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Total */}
          <Section style={totalSection}>
            <Text style={totalText}>Total Amount: ${totalAmount.toFixed(2)}</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              If you have any questions about your order, please reply to this email or contact our support team.
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
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  border: '1px solid #e6ebf1',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
};

const header = {
  padding: '24px',
  backgroundColor: '#000000',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  margin: '0',
  fontSize: '24px',
  fontWeight: 'bold',
  letterSpacing: '-1px',
};

const section = {
  padding: '24px',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '26px',
};

const boldText = {
  color: '#32325d',
  fontSize: '16px',
  fontWeight: 'bold',
  marginTop: '0',
};

const normalText = {
  fontWeight: 'normal',
};

const itemHeading = {
  color: '#32325d',
  fontSize: '18px',
  marginTop: '24px',
  marginBottom: '12px',
};

const itemText = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '4px 0',
};

const totalSection = {
  padding: '24px',
  backgroundColor: '#f8f9fa',
  textAlign: 'right' as const,
};

const totalText = {
  color: '#32325d',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
};

const divider = {
  borderTop: '1px solid #e6ebf1',
  margin: '0',
};

const footer = {
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
};

export default ReceiptEmail;
