'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Clock, Wallet } from 'lucide-react';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to BondFlow</h1>
          <p className="text-gray-600 mb-8">Please connect your wallet to view your dashboard</p>
          <ConnectButton 
            accountStatus="address"
            showBalance={false}
            chainStatus="icon"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BondFlow</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1.5 rounded-full">
              {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
            </span>
            <ConnectButton 
              accountStatus="address"
              showBalance={false}
              chainStatus="icon"
            />
          </div>
        </header>

        <main className="space-y-8">
          {/* Balance Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardHeader>
              <CardDescription className="text-indigo-100">Total Balance</CardDescription>
              <CardTitle className="text-4xl font-bold">$0.00</CardTitle>
              <div className="flex space-x-2 pt-4">
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Agent Activity */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">AI Agent Activity</CardTitle>
                <CardDescription>Recent AI-powered transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">AI Trade #{item}</div>
                        <div className="text-sm text-gray-500">Executed 10m ago</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-sm font-medium text-green-600">+0.5%</div>
                        <div className="text-xs text-gray-500">PYUSD</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div key={item} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        {item % 2 === 0 ? (
                          <ArrowDown className="h-5 w-5 text-purple-600" />
                        ) : (
                          <ArrowUp className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item % 2 === 0 ? 'Deposit' : 'Withdrawal'}
                        </div>
                        <div className="text-sm text-gray-500">Today, 10:3{5 - item} AM</div>
                      </div>
                      <div className={`ml-auto text-right ${item % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="text-sm font-medium">
                          {item % 2 === 0 ? '+' : '-'}1,000 PYUSD
                        </div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
