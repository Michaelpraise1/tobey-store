import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClerkProvider} from '@clerk/nextjs'
import { Toaster } from "react-hot-toast";



export const metadata: Metadata = {
 title: {
  template: "%s - Original Tobey Studio Store",
  default: "Original Tobey Studio",
 },
 description: "Unleash your fighting spirit with exclusive Mortal Fang Kombat gear. Premium merchandise for true warriors."
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
