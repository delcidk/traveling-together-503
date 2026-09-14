import { AuthProvider } from "./context/AuthContext";
import { ReservationProvider } from "./context/ReservationContext"; // 1. Nueva importación
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Traveling together 503",
  description: "Plataforma de gestión y reserva de transporte turístico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ReservationProvider>
            {children}
          </ReservationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}