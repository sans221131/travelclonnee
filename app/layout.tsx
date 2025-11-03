import type { Metadata } from "next";
import { dunbarText } from "@/public/fonts/font";
import ClientLayout from "@/components/layout/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlasdore Travel - Your Journey Starts Here",
  description: "Understated travel, engineered properly. ATLASDORE TRAVEL PRIVATE LIMITED - Office No: S32, 2nd Floor, Al Ezz Tower, SBUT, Bhendi Bazaar, Mumbai 400 003",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dunbarText.variable} antialiased`} suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
