import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClerkProvider} from '@clerk/nextjs'
import { Toaster } from "react-hot-toast";



export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://tobey-studios.vercel.app"),
  title: {
    template: "%s - Original Tobey Studios Store",
    default: "Original Tobey Studios",
  },
  description: "Unleash your fighting spirit with exclusive Mortal Fang Kombat gear. Premium merchandise for true warriors.",
  keywords: ["Mortal Kombat", "Mortal Fang Kombat", "Tobey Studios", "Anime merchandise", "Gaming gear", "Premium Apparel", "Tobey Store"],
  openGraph: {
    title: {
      template: "%s - Original Tobey Studios Store",
      default: "Original Tobey Studios",
    },
    description: "Unleash your fighting spirit with exclusive Mortal Fang Kombat gear. Premium merchandise for true warriors.",
    url: "https://tobey-studios.vercel.app",
    siteName: "Original Tobey Studios",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      template: "%s - Original Tobey Studios Store",
      default: "Original Tobey Studios",
    },
    description: "Unleash your fighting spirit with exclusive Mortal Fang Kombat gear. Premium merchandise for true warriors.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 
  return (
    <ClerkProvider>
        <div className="flex flex-col min-h-screen">
          <Header/>
          <main className="flex-1" >{children}</main>
          <Footer/>
        </div>
        <Toaster position="bottom-right" />
    </ClerkProvider>
  );
}
