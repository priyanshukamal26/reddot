/**
 * RedDot — Client-side Providers wrapper
 *
 * Root layout is a server component; this client component wraps
 * children with all necessary client-side providers.
 */

"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";

export default function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
