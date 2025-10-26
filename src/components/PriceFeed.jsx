'use client';

import { usePythPrices } from '@/hooks/usePythPrices';
import { useEffect, useState, useMemo } from 'react';
import { Star, Bell, BellOff, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PRICE_CHANGE_INTERVAL = 30000; // 30 seconds

export default function PriceFeed() {
  const {
    prices,
    loading,
    error,
    favorites,
    alerts,
    addAlert,
    removeAlert,
    toggleFavorite,
    setAssets,
    availableAssets
  } = usePythPrices();
  
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [priceChanges, setPriceChanges] = useState({});

  // Filter tokens based on search and active tab
  const filteredTokens = useMemo(() => {
    return Object.entries(prices).filter(([symbol]) => {
      const matchesSearch = symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const isFavorite = favorites.includes(symbol);
      
      if (activeTab === 'favorites') return matchesSearch && isFavorite;
      return matchesSearch;
    });
  }, [prices, searchQuery, activeTab, favorites]);

  // Track price changes
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceChanges(prev => {
        const changes = { ...prev };
        Object.entries(prices).forEach(([symbol, data]) => {
          const currentPrice = data.price * (10 ** data.exponent);
          const previousPrice = prev[symbol]?.price || currentPrice;
          changes[symbol] = {
            price: currentPrice,
            change: currentPrice - previousPrice,
            changePercent: ((currentPrice - previousPrice) / previousPrice) * 100
          };
        });
        return changes;
      });
    }, PRICE_CHANGE_INTERVAL);

    return () => clearInterval(interval);
  }, [prices]);

  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [prices]);

  const handleAddAlert = () => {
    if (selectedAsset && alertPrice && !isNaN(alertPrice)) {
      addAlert(selectedAsset, parseFloat(alertPrice), 'above');
      setAlertPrice('');
    }
  };

  const getPriceChangeClass = (change) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return '';
  };

  if (loading && Object.keys(prices).length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        <span className="ml-2">Loading market data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader className="text-red-600 dark:text-red-400">
          <CardTitle>Error Loading Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Market Overview</h2>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Updated: {lastUpdated}
            </p>
          )}
        </div>
        
        <div className="w-full sm:w-auto flex gap-2">
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={selectedAsset}
            onValueChange={setSelectedAsset}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Add alert" />
            </SelectTrigger>
            <SelectContent>
              {availableAssets.map((asset) => (
                <SelectItem key={asset} value={asset}>
                  {asset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Price"
            value={alertPrice}
            onChange={(e) => setAlertPrice(e.target.value)}
            className="w-32"
          />
          <Button 
            onClick={handleAddAlert}
            disabled={!selectedAsset || !alertPrice}
          >
            <Bell className="h-4 w-4 mr-2" />
            Alert
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="all">All Assets</TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            Favorites
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Price Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTokens.map(([symbol, data]) => {
          const price = data.price * (10 ** data.exponent);
          const change = priceChanges[symbol]?.change || 0;
          const changePercent = priceChanges[symbol]?.changePercent || 0;
          const hasAlert = !!alerts[symbol];
          const isFavorite = favorites.includes(symbol);

          return (
            <Card key={symbol} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{symbol}</CardTitle>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </span>
                      <span className={`text-sm ${getPriceChangeClass(change)}`}>
                        {change >= 0 ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFavorite(symbol)}
                      className={`p-1 rounded-full ${isFavorite ? 'text-yellow-400' : 'text-muted-foreground'}`}
                    >
                      <Star 
                        className="h-5 w-5" 
                        fill={isFavorite ? 'currentColor' : 'none'} 
                      />
                    </button>
                    <button
                      onClick={() => hasAlert ? removeAlert(symbol) : setSelectedAsset(symbol)}
                      className={`p-1 rounded-full ${hasAlert ? 'text-blue-500' : 'text-muted-foreground'}`}
                    >
                      {hasAlert ? (
                        <Bell className="h-5 w-5" fill="currentColor" />
                      ) : (
                        <BellOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div>Confidence: ± ${(data.confidence * (10 ** data.exponent)).toFixed(4)}</div>
                  {hasAlert && (
                    <div className="mt-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-1 rounded">
                      Alert at ${alerts[symbol].price}
                    </div>
                  )}
                </div>
              </CardContent>
              
              {/* Price change indicator */}
              {Math.abs(change) > 0 && (
                <div 
                  className={`absolute bottom-0 left-0 h-1 w-full ${
                    change > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              )}
            </Card>
          );
        })}
      </div>

      {filteredTokens.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {activeTab === 'favorites' 
            ? 'No favorite assets. Click the star icon to add some.'
            : 'No assets match your search.'}
        </div>
      )}
    </div>
  );
}
