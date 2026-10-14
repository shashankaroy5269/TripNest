"use client";

import React from "react";
import { AuthProvider } from "../lib/authContext";
import { ToastProvider } from "./Toast";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
