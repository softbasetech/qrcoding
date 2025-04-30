"use client";

import { Providers } from "@/hooks/provider-context";

interface ProvidersWrapperProps {
  children: React.ReactNode;
}

export function ProvidersWrapper({ children }: ProvidersWrapperProps) {
  return <Providers>{children}</Providers>;
}
