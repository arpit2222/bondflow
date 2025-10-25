'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDown, ArrowUp, Clock, Loader2, ExternalLink, Download, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv, formatTransactionForExport } from '@/lib/export-utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock function - replace with actual blockchain calls
async function fetchTransactions(address) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, you would fetch this from your subgraph or API
  return [
    {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      type: 'deposit',
      amount: '100.0',
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'confirmed',
      token: 'PYUSD',
      blockNumber: 12345678,
      from: '0x123...abc',
      to: '0x456...def',
      gasUsed: '45000',
      transactionIndex: 12,
    },
    {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      type: 'withdraw',
      amount: '50.0',
      timestamp: Date.now() - 86400000, // 1 day ago
      status: 'confirmed',
      token: 'PYUSD',
      blockNumber: 12345670,
      from: '0x789...ghi',
      to: '0x012...jkl',
      gasUsed: '65000',
      transactionIndex: 8,
    },
  ];
}

export default function TransactionsPage() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: transactions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', address],
    queryFn: () => fetchTransactions(address),
    enabled: !!address,
  });

  const handleExport = () => {
    try {
      const exportData = filteredTransactions.map(tx => ({
        ...tx,
        timestamp: new Date(tx.timestamp).toISOString(),
      }));
      
      exportToCsv(
        exportData.map(formatTransactionForExport),
        `bondflow-transactions-${new Date().toISOString().split('T')[0]}.csv`
      );
      
      toast({
        title: 'Export successful',
        description: 'Your transactions have been exported to a CSV file.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export transactions. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredTransactions = transactions
    .filter(tx => {
      const matchesSearch = tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.amount.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
          <p className="text-gray-600">View and manage your transaction history</p>
        </div>

        <Card className="border-0 shadow-sm mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  {filteredTransactions.length} transactions found
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExport}
                  disabled={!transactions.length}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <div className="px-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdraw">Withdrawals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.hash} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                            }`}>
                              {tx.type === 'deposit' ? (
                                <ArrowDown className="h-5 w-5" />
                              ) : (
                                <ArrowUp className="h-5 w-5" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {tx.type === 'deposit' ? 'Deposit' : 'Withdraw'} {tx.token}
                              </div>
                              <div className="text-sm text-gray-500">
                                {tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            tx.type === 'deposit' ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.token}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tx.status)}`}>
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank')}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <div className="flex justify-center">
                  <Filter className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No transactions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Your transaction history will appear here'}
                </p>
                {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
