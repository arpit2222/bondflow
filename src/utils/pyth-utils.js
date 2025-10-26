import { PriceServiceConnection } from '@pythnetwork/price-service-client';

// Using Pyth mainnet endpoint
const PYTH_ENDPOINT = 'https://hermes.pyth.network';

// Mainnet price feed IDs (as of October 2024)
// These are the most commonly used price feeds
export const PRICE_FEED_IDS = {
  // Cryptocurrencies
  BTC: '0xe62df6c8c4dc7f9b166ba46a09e7dbfd70250f13fe4ee9a820bca18979150808', // BTC/USD
  ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480814634d0dcc6', // ETH/USD
  
  // Stablecoins
  USDC: '0xeaa020c61cc479712813461ce153894a096a13983f824918b5a042f67a0a1f88', // USDC/USD
  
  // Additional popular tokens
  SOL: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d', // SOL/USD
  BNB: '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283a31d999104276', // BNB/USD
  
  // More assets can be added here
};

// Enhanced mock data with more tokens and realistic values
export const MOCK_PRICE_DATA = {
  BTC: { 
    price: 50000, 
    confidence: 100, 
    timestamp: Date.now(), 
    exponent: -8,
    name: 'Bitcoin',
    change24h: 2.5,
    volume24h: 25000000000
  },
  ETH: { 
    price: 3000, 
    confidence: 5, 
    timestamp: Date.now(), 
    exponent: -8,
    name: 'Ethereum',
    change24h: -1.2,
    volume24h: 15000000000
  },
  USDC: { 
    price: 1.0, 
    confidence: 0.001, 
    timestamp: Date.now(), 
    exponent: -6,
    name: 'USD Coin',
    change24h: 0.1,
    volume24h: 5000000000
  },
  SOL: { 
    price: 100, 
    confidence: 0.5, 
    timestamp: Date.now(), 
    exponent: -8,
    name: 'Solana',
    change24h: 5.7,
    volume24h: 3000000000
  },
  BNB: { 
    price: 400, 
    confidence: 1, 
    timestamp: Date.now(), 
    exponent: -8,
    name: 'Binance Coin',
    change24h: 0.8,
    volume24h: 2000000000
  },
  // Additional tokens
  XRP: {
    price: 0.75,
    confidence: 0.01,
    timestamp: Date.now(),
    exponent: -6,
    name: 'Ripple',
    change24h: -0.5,
    volume24h: 1800000000
  },
  ADA: {
    price: 0.45,
    confidence: 0.005,
    timestamp: Date.now(),
    exponent: -6,
    name: 'Cardano',
    change24h: 1.2,
    volume24h: 1200000000
  },
  AVAX: {
    price: 35.50,
    confidence: 0.1,
    timestamp: Date.now(),
    exponent: -8,
    name: 'Avalanche',
    change24h: 3.2,
    volume24h: 900000000
  },
  DOT: {
    price: 7.20,
    confidence: 0.05,
    timestamp: Date.now(),
    exponent: -8,
    name: 'Polkadot',
    change24h: -0.8,
    volume24h: 700000000
  },
  MATIC: {
    price: 1.20,
    confidence: 0.01,
    timestamp: Date.now(),
    exponent: -8,
    name: 'Polygon',
    change24h: 2.1,
    volume24h: 600000000
  }
};

// Function to fetch price data with fallback
const PRICE_ALERTS = new Map();

export async function getPythPrices(priceIds = Object.values(PRICE_FEED_IDS)) {
  try {
    const connection = new PriceServiceConnection(PYTH_ENDPOINT, {
      priceFeedRequestConfig: {
        binary: true,
      },
    });
    
    console.log('Fetching price feeds for IDs:', priceIds);
    
    // Get the latest price feeds
    const priceFeeds = await connection.getLatestPriceFeeds(priceIds);
    
    if (!priceFeeds || priceFeeds.length === 0) {
      console.warn('No price feeds found for the given IDs, using mock data');
      return getMockPrices(priceIds);
    }
    
    // Map the price feeds to a more usable format
    const prices = {};
    
    priceFeeds.forEach((priceFeed, index) => {
      if (!priceFeed) {
        console.warn(`No price feed found at index ${index}`);
        return;
      }
      
      const price = priceFeed.getPriceNoOlderThan(60); // Get price no older than 60 seconds
      if (!price) {
        console.warn(`No recent price available for feed ${priceFeed.id}`);
        return;
      }
      
      const symbol = Object.keys(PRICE_FEED_IDS).find(
        key => PRICE_FEED_IDS[key] === priceFeed.id
      );
      
      if (symbol) {
        prices[symbol] = {
          price: price.price,
          confidence: price.confidence,
          timestamp: price.publishTime,
          exponent: price.exponent,
        };
      } else {
        console.warn(`No symbol found for price feed ID: ${priceFeed.id}`);
      }
    });
    
    // If we didn't get any valid prices, use mock data
    if (Object.keys(prices).length === 0) {
      console.warn('No valid prices found, using mock data');
      return getMockPrices(priceIds);
    }
    
    return prices;
  } catch (error) {
    console.error('Error in getPythPrices:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    // Return empty object instead of throwing to prevent UI crashes
    return {};
  }
}

// Function to get mock price update
function getMockPriceUpdate(symbol) {
  const mockData = MOCK_PRICE_DATA[symbol];
  if (!mockData) return null;
  
  // Add some randomness to mock price changes
  const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% change
  const newPrice = mockData.price * (1 + fluctuation);
  
  return {
    symbol,
    price: Math.round(newPrice * 100) / 100, // Round to 2 decimal places
    confidence: mockData.confidence,
    timestamp: Date.now(),
    exponent: mockData.exponent,
  };
}

export async function subscribeToPythPrices(priceIds, callback) {
  if (!priceIds || priceIds.length === 0) {
    console.warn('No price IDs provided to subscribeToPythPrices');
    return () => {};
  }

  let connection;
  let mockInterval;
  
  try {
    connection = new PriceServiceConnection(PYTH_ENDPOINT, {
      priceFeedRequestConfig: {
        binary: true,
      },
    });
    // Subscribe to price updates
    await connection.subscribePriceFeedUpdates(priceIds, (priceFeed) => {
      if (!priceFeed) {
        console.warn('Received undefined price feed in subscription');
        return;
      }

      const price = priceFeed.getPriceNoOlderThan(60);
      if (!price) {
        console.warn('No recent price available in subscription update');
        return;
      }

      const symbol = Object.keys(PRICE_FEED_IDS).find(
        key => PRICE_FEED_IDS[key] === priceFeed.id
      );
      
      if (symbol) {
        callback({
          symbol,
          price: price.price,
          confidence: price.confidence,
          timestamp: price.publishTime,
          exponent: price.exponent,
        });
      } else {
        console.warn(`No symbol found for price feed ID in subscription: ${priceFeed.id}`);
      }
    });
    
    console.log('Successfully subscribed to price feed updates');
    
    const cleanup = () => {
      console.log('Cleaning up WebSocket connection');
      if (connection) {
        connection.closeWebSocket();
      }
      if (mockInterval) {
        clearInterval(mockInterval);
      }
    };
    
    // If we're in development or if there was an error, set up mock updates
    if (process.env.NODE_ENV === 'development' || !connection) {
      console.log('Setting up mock price updates');
      // Send initial mock updates
      priceIds.forEach(id => {
        const symbol = Object.keys(PRICE_FEED_IDS).find(key => PRICE_FEED_IDS[key] === id);
        if (symbol) {
          const update = getMockPriceUpdate(symbol);
          if (update) callback(update);
        }
      });
      
      // Set up interval for mock updates
      mockInterval = setInterval(() => {
        priceIds.forEach(id => {
          const symbol = Object.keys(PRICE_FEED_IDS).find(key => PRICE_FEED_IDS[key] === id);
          if (symbol && Math.random() > 0.7) { // 30% chance of update each interval
            const update = getMockPriceUpdate(symbol);
            if (update) callback(update);
          }
        });
      }, 5000); // Update every 5 seconds
      
      return cleanup;
    }
    
    return cleanup;
  } catch (error) {
    console.error('Error in subscribeToPythPrices:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    // Return a no-op function since we don't have a connection to close
    return () => {};
  }
}
