"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/configs/supabase";

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isPublicRoute = useMemo(() => {
    if (pathname === "/") return true;
    return (
      pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/auth/callback")
    );
  }, [pathname]);

  useEffect(() => {
    let isMounted = true;

    const redirectToLogin = () => {
      const nextPath = `${window.location.pathname}${window.location.search}`;
      router.replace(`/sign-in?redirectTo=${encodeURIComponent(nextPath)}`);
    };

    const checkSession = async () => {
      if (isPublicRoute) {
        if (isMounted) setCheckingAuth(false);
        return;
      }

      if (isMounted) setCheckingAuth(true);
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error || !data.session) {
        redirectToLogin();
        return;
      }

      setCheckingAuth(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isPublicRoute) return;

        if (event === "SIGNED_OUT" || !session) {
          redirectToLogin();
          return;
        }

        setCheckingAuth(false);
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [isPublicRoute, router]);

  if (checkingAuth && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nova-bg text-sm font-medium text-nova-body">
        Checking access...
      </div>
    );
  }

  return <>{children}</>;
}
