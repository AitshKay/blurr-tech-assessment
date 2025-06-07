"use client";

import { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoginForm from "./login-form";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Don't render the login form for authenticated users
  if (status === "authenticated") {
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Suspense fallback={
        <div className="w-full max-w-md p-8">
          <p>Loading login form...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
} 