import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/auth-context";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sage: A Christian Self-Care App",
  description: "By SageField",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ overflowX: "hidden" }}>
      <body
        className={`${nunito.variable} antialiased`}
        style={{ overflowX: "hidden" }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
