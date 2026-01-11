'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to the homepage after sign-out
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-900 text-white py-4 px-6 hidden md:flex items-center justify-center">
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-gray-400" prefetch={false}>
            Dashboard
          </Link>
          <Link href="/properties" className="hover:text-gray-400" prefetch={false}>
            Properties
          </Link>
          <Link href="/tenants" className="hover:text-gray-400" prefetch={false}>
            Tenants
          </Link>
          <Link href="/payments" className="hover:text-gray-400" prefetch={false}>
            Payments
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
