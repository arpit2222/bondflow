import { useEffect, useState, useCallback } from 'react';
import { 
  getPythPrices, 
  subscribeToPythPrices, 
  PRICE_FEED_IDS,
  MOCK_PRICE_DATA
} from '@/utils/pyth-utils';

// Helper function to get price feed ID from symbol
const getPriceFeedId = (symbol) => PRICE_FEED_IDS[symbol] || null;

// Get all available tokens from MOCK_PRICE_DATA
const ALL_TOKENS = Object.keys(MOCK_PRICE_DATA);

export function usePythPrices(initialAssets = ALL_TOKENS.slice(0, 4)) {
  const [assets, setAssets] = useState(initialAssets);
  const [favorites, setFavorites] = useState(() => {
    // Load favorites from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pythFavorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [alerts, setAlerts] = useState({});
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Save favorites to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pythFavorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  // Check for price alerts
  const checkAlerts = useCallback((newPrices) => {
    Object.entries(alerts).forEach(([symbol, { price, type }]) => {
      const currentPrice = newPrices[symbol]?.price * Math.pow(10, newPrices[symbol]?.exponent || 0);
      if (currentPrice && ((type === 'above' && currentPrice >= price) || 
                          (type === 'below' && currentPrice <= price))) {
        // Trigger alert (you can replace this with a toast notification)
        console.log(`Alert: ${symbol} is now ${type} $${price}`);
        // Remove the triggered alert
        setAlerts(prev => {
          const newAlerts = { ...prev };
          delete newAlerts[symbol];
          return newAlerts;
        });
      }
    });
  }, [alerts]);

  // Add a price alert
  const addAlert = useCallback((symbol, price, type = 'above') => {
    setAlerts(prev => ({
      ...prev,
      [symbol]: { price, type }
    }));
  }, []);

  // Remove a price alert
  const removeAlert = useCallback((symbol) => {
    setAlerts(prev => {
      const newAlerts = { ...prev };
      delete newAlerts[symbol];
      return newAlerts;
    });
  }, []);

  // Toggle favorite status for a token
  const toggleFavorite = useCallback((symbol) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  }, []);

  // Fetch available price feeds on mount
  useEffect(() => {
    const loadAvailableFeeds = async () => {
      try {
        const feeds = await fetchLatestPriceFeedIds();
        if (feeds && feeds.length > 0) {
          setAvailableFeeds(feeds);
        }
      } catch (err) {
        console.warn('Could not fetch available price feeds, using defaults', err);
      }
    };
    
    loadAvailableFeeds();
  }, []);

  // Initial fetch and subscription
  useEffect(() => {
    let isMounted = true;
    
    const fetchInitialPrices = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        
        // Only include assets that have valid price feed IDs
        const validAssets = assets.filter(asset => getPriceFeedId(asset));
        
        if (validAssets.length === 0) {
          console.warn('No valid price feed IDs found for the selected assets');
          if (isMounted) {
            setError('No valid price feeds available for the selected assets');
            setLoading(false);
          }
          return;
        }
        
        console.log('Fetching prices for assets:', validAssets);
        const priceData = await getPythPrices(validAssets.map(getPriceFeedId));
        
        if (!isMounted) return;
        
        if (Object.keys(priceData).length === 0) {
          console.warn('Received empty price data, using mock data');
          // Use mock data as fallback
          const mockData = validAssets.reduce((acc, asset) => {
            const mockPrice = MOCK_PRICE_DATA[asset];
            if (mockPrice) {
              acc[asset] = {
                price: mockPrice.price,
                confidence: mockPrice.confidence,
                timestamp: mockPrice.timestamp,
                exponent: mockPrice.exponent,
              };
            }
            return acc;
          }, {});
          
          if (Object.keys(mockData).length > 0) {
            setPrices(mockData);
            checkAlerts(mockData);
            setError('Using mock data - real-time updates may be limited');
          } else {
            throw new Error('No price data available');
          }
        } else {
          setPrices(priceData);
          checkAlerts(priceData);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch initial prices:', err);
        if (isMounted) {
          setError('Failed to load price data. Using mock data instead.');
          // Set mock data
          const mockData = assets.reduce((acc, asset) => {
            const mockPrice = MOCK_PRICE_DATA[asset];
            if (mockPrice) {
              acc[asset] = {
                price: mockPrice.price,
                confidence: mockPrice.confidence,
                timestamp: mockPrice.timestamp,
                exponent: mockPrice.exponent,
              };
            }
            return acc;
          }, {});
          
          if (Object.keys(mockData).length > 0) {
            setPrices(mockData);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialPrices();

    // Subscribe to updates
    const priceIds = assets
      .map(getPriceFeedId)
      .filter(Boolean);
      
    if (priceIds.length === 0) {
      console.warn('No valid price feed IDs to subscribe to');
      return;
    }

    let unsubscribe;
    
    const setupSubscription = async () => {
      try {
        unsubscribe = await subscribeToPythPrices(priceIds, (update) => {
          setPrices(prev => {
            const newPrices = {
              ...prev,
              [update.symbol]: {
                price: update.price,
                confidence: update.confidence,
                timestamp: update.timestamp,
                exponent: update.exponent,
              },
            };
            checkAlerts(newPrices);
            return newPrices;
          });
        });
      } catch (err) {
        console.error('Failed to subscribe to price updates:', err);
        setError('Failed to subscribe to real-time updates');
      }
    };
    
    setupSubscription();

    // Cleanup function
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [assets, checkAlerts]);

  // Format price for display
  const getFormattedPrice = (symbol) => {
    const priceData = prices[symbol];
    if (!priceData) return 'N/A';
    
    const price = priceData.price * Math.pow(10, priceData.exponent || 0);
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  };

  return { 
    prices, 
    loading, 
    error, 
    favorites,
    alerts,
    addAlert,
    removeAlert,
    toggleFavorite,
    setAssets,
    getFormattedPrice,
    availableAssets: Object.keys(PRICE_FEED_IDS)
  };
}
