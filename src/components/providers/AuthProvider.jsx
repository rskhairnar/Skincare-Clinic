// components/providers/AuthProvider.jsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const { token, user, isHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for hydration
    if (!isHydrated) return;

    const publicPaths = ["/login", "/register", "/forgot-password"];
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    if (!token || !user) {
      if (!isPublicPath) {
        router.push("/login");
      }
    } else {
      if (isPublicPath) {
        router.push("/dashboard");
      }
    }

    setIsLoading(false);
  }, [token, user, pathname, router, isHydrated]);

  // Show loading while checking auth
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return children;
}
