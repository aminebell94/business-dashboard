"use client";

import type { ReactNode } from "react";
// If you use next-themes or any other global providers, keep them:
import { ThemeProvider as NextThemesProvider } from "next-themes";
import ReactQueryProvider from "@/components/providers/react-query";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ReactQueryProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ReactQueryProvider>
    </NextThemesProvider>
  );
}
