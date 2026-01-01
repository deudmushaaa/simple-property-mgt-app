'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building, CreditCard, LogOut, LogIn, Users } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/properties", icon: Building, label: "Properties" },
  { href: "/tenants", icon: Users, label: "Tenants" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
];

export function Nav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    await auth.signOut();
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return (
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b">
        <h1 className="text-xl font-bold">Karibu</h1>
        <Button asChild>
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" /> Login
          </Link>
        </Button>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b">
       <nav className="flex items-center gap-4">
        <Link href="/dashboard" className="text-lg font-bold">
          Karibu
        </Link>
        <div className="hidden md:flex items-center gap-4">
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        </div>
      </nav>
      <Button onClick={handleSignOut} variant="outline">
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>
    </header>
  );
}
