'use client';

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Home, Building2, Users, CreditCard } from 'lucide-react'

const navLinks = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/properties", icon: Building2, label: "Properties" },
  { href: "/tenants", icon: Users, label: "Tenants" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            {navLinks.map(link => (
              <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${pathname?.startsWith(link.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="sr-only">{link.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{link.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-background sm:hidden">
        <div className="flex items-center justify-around">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-2 px-3 text-xs ${pathname?.startsWith(link.href)
                  ? "text-primary"
                  : "text-muted-foreground"
                }`}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
