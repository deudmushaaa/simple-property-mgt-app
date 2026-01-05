'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { signOutUser } from '@/lib/auth';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
      <Breadcrumbs />
      <div className="ml-auto">
        <Button onClick={() => signOutUser()}>Sign Out</Button>
      </div>
    </header>
  );
}
