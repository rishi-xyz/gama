import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Footer } from "@/src/components/footer";
import { Navbar } from "@/src/components/navbar";
import { Toaster } from "@/src/ui/sonner";

const manrope = Manrope({
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Gama",
  description: "A web Wallet",
  icons: "/wallet.png"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.className} antialiased overflow-hidden`}
      >
        <Navbar />
          {children}
        <Footer />
        <Toaster  position="top-right" />
      </body>
    </html>
  );
}
