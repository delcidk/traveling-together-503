import { AuthProvider } from "./context/AuthContext";
import { ReservationProvider } from "./context/ReservationContext";
import { VehiclesProvider } from "./context/VehiclesContext";
import { RoutesProvider } from "./context/RoutesContext";
import { TripsProvider } from "./context/TripsContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
        <Toaster position="top-right" />
        <AuthProvider>
          <VehiclesProvider>
            <RoutesProvider>
              <TripsProvider>
                <ReservationProvider>
                  {children}
                </ReservationProvider>
              </TripsProvider>
            </RoutesProvider>
          </VehiclesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}