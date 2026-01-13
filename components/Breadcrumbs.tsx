'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';

const breadcrumbNameMap: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/properties': 'Properties',
  '/tenants': 'Tenants',
  '/payments': 'Payments',
  '/settings': 'Settings',
  '/properties/add': 'Add Property',
  '/tenants/add': 'Add Tenant',
  '/payments/add': 'Record Payment',
};

export function Breadcrumbs() { // Renamed from Breadcrumbs to Breadcrumbs
  const pathname = usePathname();
  const pathSegments = pathname ? pathname.split('/').filter(segment => segment) : [];

  return (
    <nav className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
      <Link href="/dashboard" className="hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      {pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/');
        const isLast = index === pathSegments.length - 1;
        let name = breadcrumbNameMap[href] || segment.charAt(0).toUpperCase() + segment.slice(1);

        if (pathSegments.length > 2 && (pathSegments[index - 1] === 'edit' || pathSegments[index - 1] === 'properties' || pathSegments[index - 1] === 'tenants')) {
          name = 'Details'
        }

        return (
          <div key={href} className="flex items-center space-x-2">
            <span>/</span>
            <Link
              href={href}
              className={`${isLast ? 'text-foreground' : 'hover:text-foreground'}`}
            >
              {name}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}