import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description: "Finalize your purchase securely. Enter shipping, contact, and billing details.",
  robots: {
    index: false, // Disallow search engine indexing on checkout for security and privacy
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
