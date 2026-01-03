'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  Building2,
  Users,
  CreditCard,
  PanelLeft,
  Settings,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs'; // Corrected import

const navLinks = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/properties", icon: Building2, label: "Properties" },
  { href: "/tenants", icon: Users, label: "Tenants" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
];

export function Header() {
  const pathname = usePathname();

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/dashboard"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <Building2 className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">PropertyMGT</span>
          </Link>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4 px-2.5 ${
                pathname.startsWith(link.href) 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
           <Link
              href="/settings"
              className={`flex items-center gap-4 px-2.5 ${
                pathname.startsWith("/settings")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
      <MobileNav />
      <Breadcrumbs />
    </header>
  );
}
