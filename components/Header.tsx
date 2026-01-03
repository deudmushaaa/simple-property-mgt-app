'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function Header() {
  const pathname = usePathname();

  // Handle root case separately for clarity
  if (pathname === '/' || pathname === '/dashboard') {
    return (
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </header>
    );
  }

  const segments = pathname.split('/').filter(Boolean);
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Programmatically build the breadcrumbs to ensure valid JSX
  const breadcrumbElements = [];

  // Always add the root Dashboard link
  breadcrumbElements.push(
    <BreadcrumbItem key="dashboard-root">
      <BreadcrumbLink asChild>
        <Link href="/dashboard">Dashboard</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
  );

  segments.forEach((segment, index) => {
    // Skip the 'dashboard' segment as it's the implicit root
    if (segment.toLowerCase() === 'dashboard') {
      return;
    }

    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const isLast = index === segments.length - 1;

    // Add separator
    breadcrumbElements.push(<BreadcrumbSeparator key={`sep-${index}`} />);

    breadcrumbElements.push(
      <BreadcrumbItem key={href}>
        {isLast ? (
          <BreadcrumbPage>{capitalize(segment)}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink asChild>
            <Link href={href}>{capitalize(segment)}</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    );
  });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
      <Breadcrumb>
        <BreadcrumbList>{breadcrumbElements}</BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
