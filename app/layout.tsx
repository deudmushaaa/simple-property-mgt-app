import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/AuthProvider";
import { Nav } from "@/components/Nav";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Property Management Tool",
  description: "A tool for landlords in Uganda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Nav />
            {children}
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
