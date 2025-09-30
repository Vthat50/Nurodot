import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StudyProvider } from "@/contexts/study-context";
import { PatientProvider } from "@/contexts/patient-context";
import { CampaignProvider } from "@/contexts/campaign-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nurodot - AI-Powered Clinical Trial Screening",
  description: "Streamlined platform for EHR ingestion, voice AI screening, and deep analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StudyProvider>
          <PatientProvider>
            <CampaignProvider>
              {children}
            </CampaignProvider>
          </PatientProvider>
        </StudyProvider>
      </body>
    </html>
  );
}
