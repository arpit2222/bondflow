'use client';

import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

// Mock data - in a real app, this would come from your smart contract or API
const BONDS = [
  {
    id: 1,
    name: 'USDC Bond',
    issuer: 'Circle',
    apy: '5.25%',
    maturity: '12 months',
    minInvestment: '100 USDC',
    status: 'Open',
  },
  {
    id: 2,
    name: 'USDT Bond',
    issuer: 'Tether',
    apy: '4.75%',
    maturity: '6 months',
    minInvestment: '50 USDT',
    status: 'Open',
  },
  {
    id: 3,
    name: 'DAI Bond',
    issuer: 'MakerDAO',
    apy: '5.50%',
    maturity: '24 months',
    minInvestment: '200 DAI',
    status: 'Coming Soon',
  },
];

export default function BondsPage() {
  const { isConnected } = useAccount();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bond Marketplace</h1>
        <p className="text-muted-foreground">
          Browse and invest in a variety of bond offerings
        </p>
      </div>

      <div className="mb-8">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="all">All Bonds</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="coming-soon">Coming Soon</TabsTrigger>
            </TabsList>
            <div className="flex w-full sm:w-auto gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search bonds..."
                  className="w-full bg-background pl-8"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {BONDS.map((bond) => (
              <BondCard key={bond.id} bond={bond} isConnected={isConnected} />
            ))}
          </TabsContent>
          <TabsContent value="open" className="space-y-4">
            {BONDS.filter(b => b.status === 'Open').map((bond) => (
              <BondCard key={bond.id} bond={bond} isConnected={isConnected} />
            ))}
          </TabsContent>
          <TabsContent value="coming-soon" className="space-y-4">
            {BONDS.filter(b => b.status === 'Coming Soon').map((bond) => (
              <BondCard key={bond.id} bond={bond} isConnected={isConnected} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BondCard({ bond, isConnected }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{bond.name}</CardTitle>
            <CardDescription className="mt-1">Issued by {bond.issuer}</CardDescription>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            bond.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {bond.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">APY</p>
            <p className="font-medium">{bond.apy}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Maturity</p>
            <p className="font-medium">{bond.maturity}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Min. Investment</p>
            <p className="font-medium">{bond.minInvestment}</p>
          </div>
          <div className="flex items-end">
            <Button 
              className="w-full" 
              disabled={!isConnected || bond.status !== 'Open'}
            >
              {!isConnected ? 'Connect Wallet' : bond.status === 'Open' ? 'Invest' : 'Coming Soon'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
