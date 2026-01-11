'use client';

import { createContext, useContext } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import LoginPage from '@/app/login/page';
import { AuthError, User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // fast-fail if config is missing
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return (
      <div className="flex h-screen items-center justify-center p-4 text-center">
        <div className="max-w-md rounded-lg border-2 border-destructive bg-destructive/10 p-6 text-destructive-foreground">
          <h2 className="text-lg font-bold">Configuration Error</h2>
          <p className="mt-2 text-sm text-foreground">
            Firebase API Key is missing. Please check your <code className="font-mono bg-muted px-1 rounded">.env.local</code> file.
          </p>
        </div>
      </div>
    );
  }

  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p>Error: {(error as AuthError).message}</p>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
