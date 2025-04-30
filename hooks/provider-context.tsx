"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { AuthProvider } from "./use-auth";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // assuming you adjust this correctly:
            // queryFn: getQueryFn({ on401: 'throw' }),
            refetchInterval: false,
            refetchOnWindowFocus: false,
            staleTime: Infinity,
            retry: false,
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <SessionProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              {children}
            </TooltipProvider>
          </AuthProvider>
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
