'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

// Mock transaction data - in a real app, this would come from your backend or subgraph
export function useTransactionHistory() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  // Mock function to simulate fetching transactions
  const fetchTransactions = useCallback(async (pageNum = 1) => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you would fetch from your backend or subgraph
      // const response = await fetch(`/api/transactions?address=${address}&page=${pageNum}&limit=${pageSize}`);
      // const data = await response.json();
      
      // Mock data
      const mockTransactions = Array.from({ length: pageSize }, (_, i) => ({
        id: `tx-${pageNum}-${i}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        type: ['deposit', 'withdrawal', 'trade'][Math.floor(Math.random() * 3)],
        amount: formatEther(BigInt(Math.floor(Math.random() * 10000) + 1000)),
        timestamp: Date.now() - (i * 3600000), // 1 hour apart
        status: 'completed',
        from: address,
        to: '0x' + Math.random().toString(16).substr(2, 40)
      }));
      
      setTransactions(prev => pageNum === 1 ? mockTransactions : [...prev, ...mockTransactions]);
      setHasMore(true); // In a real app, check if there are more pages
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchTransactions(page + 1);
    }
  }, [fetchTransactions, isLoading, hasMore, page]);

  const refresh = useCallback(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

// Helper function to format transaction data for display
export function formatTransaction(tx) {
  const isIncoming = tx.type === 'deposit' || (tx.type === 'trade' && tx.to === tx.address);
  
  return {
    ...tx,
    isIncoming,
    amountFormatted: parseFloat(tx.amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }),
    date: new Date(tx.timestamp).toLocaleDateString(),
    time: new Date(tx.timestamp).toLocaleTimeString(),
    typeLabel: tx.type.charAt(0).toUpperCase() + tx.type.slice(1)
  };
}
