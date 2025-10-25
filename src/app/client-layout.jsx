'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Web3Provider } from "@/providers/web3-provider";
import { ToastProviderWrapper } from "@/providers/toast-provider";
import { TransactionProvider } from "@/providers/toast-provider";
import { Toast, ToastViewport } from "@/components/ui/toast";
import Navbar from "@/components/navbar";

export default function ClientLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <TransactionProvider>
          <ToastProviderWrapper>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
            <ToastViewport />
          </ToastProviderWrapper>
        </TransactionProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
}
