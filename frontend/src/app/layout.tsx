import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "PRESENTE",
  description: "PRESENTE: The unified school experience platform. Effortlessly manage attendance, course materials, and assignments for students, lecturers, and institutions.",
  icons: {
    icon: '/icon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.className} ${plusJakartaSans.variable} bg-gray-50 text-gray-900 min-h-screen antialiased`}>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              className: 'font-bold text-sm rounded-2xl shadow-lg',
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }} 
          />
        </AuthProvider>
      </body>
    </html>
  );
}
