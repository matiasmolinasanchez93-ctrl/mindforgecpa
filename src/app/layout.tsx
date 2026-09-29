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
    default: "MindForge — Aprende IA, piensa por ti mismo",
    template: "%s — MindForge",
  },
  description:
    "Una plataforma interactiva de aprendizaje con IA que ayuda a los estudiantes a comprender, practicar, verificar y pensar de forma independiente. No delegues tu cerebro. Mejóralo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <div className="min-h-screen">{children}</div>
        <Toaster position="top-center" closeButton toastOptions={{ style: { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--card-border)", borderRadius: "var(--radius-control)", boxShadow: "var(--shadow-raised)" } }} />
      </body>
    </html>
  );
}
