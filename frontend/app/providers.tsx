"use client";

import { WagmiProvider } from "wagmi";
import { config } from "@/lib/config";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ProvidersProps {
  children: ReactNode;
}
const queryClient = new QueryClient();
export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
