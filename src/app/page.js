'use client';

import { useAccount } from 'wagmi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to BondFlow</h1>
          <p className="text-xl text-muted-foreground">
            A modern Web3 bond platform built with Next.js and RainbowKit
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>Get started by connecting your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isConnected 
                  ? '🎉 Wallet connected! You\'re ready to go.' 
                  : 'Click the Connect Wallet button in the navbar to begin.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Explore Bonds</CardTitle>
              <CardDescription>Discover available bond offerings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Browse through a variety of bond options with different terms and yields.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Portfolio</CardTitle>
              <CardDescription>Track your bond investments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor your bond holdings, maturity dates, and returns in one place.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isConnected 
              ? 'Start exploring bond offerings or check your portfolio.' 
              : 'Connect your wallet to explore bond offerings and start investing.'}
          </p>
        </div>
      </div>
    </div>
  );
}
