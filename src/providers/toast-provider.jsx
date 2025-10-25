'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useTransactionReceipt } from 'wagmi';
import { Toast, ToastAction, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function ToastProviderWrapper({ children }) {
  const [pendingTxs, setPendingTxs] = React.useState([]);
  const { toast } = useToast();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Check transaction status
  useTransactionReceipt({
    hash: pendingTxs[0]?.hash,
    onSuccess: (receipt) => {
      if (receipt.status === 'success') {
        toast({
          title: 'Transaction Confirmed',
          description: 'Your transaction was successful!',
          variant: 'success',
        });
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['balance', address] });
        queryClient.invalidateQueries({ queryKey: ['transactions', address] });
      } else {
        toast({
          title: 'Transaction Failed',
          description: 'Your transaction was not successful.',
          variant: 'destructive',
        });
      }
      // Remove from pending transactions
      setPendingTxs((prev) => prev.slice(1));
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to check transaction status',
        variant: 'destructive',
      });
      setPendingTxs((prev) => prev.slice(1));
    },
  });

  const addPendingTx = (tx) => {
    setPendingTxs((prev) => [...prev, tx]);
    toast({
      title: 'Transaction Sent',
      description: 'Your transaction has been submitted to the network.',
      action: (
        <ToastAction 
          altText="View on explorer" 
          onClick={() => {
            window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank');
          }}
        >
          View
        </ToastAction>
      ),
    });
  };

  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}

export const useTransaction = () => {
  const { addPendingTx } = React.useContext(TransactionContext);
  return { addPendingTx };
};

const TransactionContext = React.createContext(null);

export function TransactionProvider({ children }) {
  const [pendingTxs, setPendingTxs] = React.useState([]);

  const addPendingTx = React.useCallback((tx) => {
    setPendingTxs((prev) => [...prev, tx]);
  }, []);

  const value = React.useMemo(
    () => ({
      pendingTxs,
      addPendingTx,
    }),
    [pendingTxs, addPendingTx]
  );

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}
