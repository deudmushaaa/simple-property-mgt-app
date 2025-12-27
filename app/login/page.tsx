"use client";

import { Button } from "@/components/ui/button";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (user) {
    router.push("/");
    return null;
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome Back</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Sign in to manage your properties.
        </p>
        <Button onClick={handleGoogleSignIn} className="w-full">
          Sign in with Google
        </Button>
      </div>
    </main>
  );
}
