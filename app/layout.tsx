import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "DevTrack Pro - Developer Productivity Dashboard",
  description:
    "Production-quality developer study, daily routine, and career advancement operating system built with Next.js, React, and Supabase.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className="antialiased selection:bg-brand-primary selection:text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
