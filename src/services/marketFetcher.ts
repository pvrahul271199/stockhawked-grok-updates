import axios from 'axios';
import logger from '../utils/logger.js';
import { MarketData } from '../types/index.js';

export class MarketFetcher {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.MARKET_API_URL || 'http://lsoksk04gw8coogskks4coco.188.245.217.56.sslip.io/api/market-band';
  }

  async fetchMarketSnapshot(): Promise<MarketData> {
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Fetching market data (attempt ${attempt}/${maxRetries})`);
        
        const response = await axios.get(this.apiUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'MarketSnapshotBot/1.0.0',
            'Accept': 'application/json'
          }
        });
        
        if (!response.data || typeof response.data.isMarketOpen !== 'boolean') {
          throw new Error('Invalid API response format');
        }

        const data: MarketData = response.data;
        
        logger.info('Market data fetched successfully', {
          isMarketOpen: data.isMarketOpen,
          indicesCount: data.indices?.length || 0,
          gainersCount: data.topGainers?.length || 0,
          losersCount: data.topLosers?.length || 0
        });

        return data;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Market fetch attempt ${attempt} failed: ${errorMsg}`);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to fetch market data after ${maxRetries} attempts: ${errorMsg}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }
    
    throw new Error('All retry attempts exhausted');
  }
}
