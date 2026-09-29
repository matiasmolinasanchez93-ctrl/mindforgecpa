import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MindForge — Learn AI, Think Independently",
    template: "%s — MindForge",
  },
  description:
    "An interactive AI learning platform that helps students understand, practice, verify, and think independently. Don't outsource your brain. Upgrade it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <div className="min-h-screen">{children}</div>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
