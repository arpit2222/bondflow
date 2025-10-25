'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDown, ArrowUp, Clock, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export function RecentTransactions({ limit = 5 }) {
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: () => fetch('/api/transactions/recent').then(res => res.json()),
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load recent transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Transactions</h3>
        <Link href="/transactions">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>
      
      {transactions?.slice(0, limit).map((tx) => (
        <div 
          key={tx.hash}
          className="flex items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-shadow"
        >
          <div className={`p-2 rounded-full ${
            tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
          }`}>
            {tx.type === 'deposit' ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </div>
          
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {tx.type === 'deposit' ? 'Deposit' : 'Withdraw'} {tx.token}
              </span>
              <span className={`text-sm ${getStatusColor(tx.status)}`}>
                {tx.status}
              </span>
            </div>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
              <span className="mx-2">•</span>
              <span className="font-medium">
                {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.token}
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-2"
            onClick={() => window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      {!transactions?.length && (
        <div className="text-center py-6 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">No recent transactions</p>
          <p className="text-sm text-gray-400 mt-1">
            Your transactions will appear here
          </p>
        </div>
      )}
    </div>
  );
}
