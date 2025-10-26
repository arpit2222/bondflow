"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePythPrices } from "@/hooks/usePythPrices";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowDownRight, Plus, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioPage() {
  const { prices, loading, error, favorites, toggleFavorite, getFormattedPrice } = usePythPrices();
  const [activeTab, setActiveTab] = useState("all");
  const [totalValue, setTotalValue] = useState(0);
  const router = useRouter();

  // Calculate total portfolio value
  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      const total = Object.entries(prices).reduce((sum, [symbol, data]) => {
        // Use a default quantity of 1 for demo purposes
        // In a real app, this would come from user's actual holdings
        const quantity = 1;
        const price = data.price * Math.pow(10, data.exponent || 0);
        return sum + (price * quantity);
      }, 0);
      setTotalValue(total);
    }
  }, [prices]);

  const filteredTokens = Object.entries(prices).filter(([symbol, data]) => {
    if (activeTab === "favorites") return favorites.includes(symbol);
    return true;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
          <p className="text-muted-foreground mt-1">Track and manage your cryptocurrency assets</p>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg w-full md:w-auto">
          <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span className="text-green-500 flex items-center">
              +2.3% <ArrowUpRight className="h-3 w-3 ml-1" />
            </span>
            <span className="text-muted-foreground">24h change</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="all">All Assets</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          <Button onClick={() => router.push('/portfolio/add')}>
            <Plus className="h-4 w-4 mr-2" /> Add Asset
          </Button>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {filteredTokens.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium">No assets found</h3>
              <p className="text-muted-foreground mt-1">
                {activeTab === 'favorites' 
                  ? 'You haven\'t favorited any assets yet.' 
                  : 'Add some assets to get started.'}
              </p>
              <Button className="mt-4" onClick={() => router.push('/portfolio/add')}>
                <Plus className="h-4 w-4 mr-2" /> Add Asset
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTokens.map(([symbol, data]) => (
                <Card key={symbol} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <span className="text-lg">{symbol}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(symbol);
                        }}
                        className={`p-1 rounded-full ${favorites.includes(symbol) ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`}
                      >
                        {favorites.includes(symbol) ? '★' : '☆'}
                      </button>
                    </CardTitle>
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-bold">{symbol[0]}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getFormattedPrice(symbol)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      {data.change24h !== undefined && (
                        <span className={`flex items-center ${data.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {getChangeIcon(data.change24h)}
                          {Math.abs(data.change24h)}%
                        </span>
                      )}
                      <span className="mx-2">•</span>
                      <span>24h</span>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Holding</span>
                        <span>1 {symbol}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Value</span>
                        <span>{getFormattedPrice(symbol)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
