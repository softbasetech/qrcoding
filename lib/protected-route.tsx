"use client";

import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // While loading session
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user, redirect
  if (!session || !session.user) {
    router.push(`/auth?callbackUrl=${encodeURIComponent(path)}`);
    return null;
  }

  // If user is authenticated
  return <Component />;
}
