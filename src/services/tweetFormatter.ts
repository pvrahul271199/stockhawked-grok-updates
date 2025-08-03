import moment from 'moment-timezone';
import { MarketData, IndexData, StockData } from '../types/index.js';
import logger from '../utils/logger.js';

export class TweetFormatter {
  formatMarketSnapshot(data: MarketData): string {
    const timeStr = moment().tz('Asia/Kolkata').format('HH:mm') + ' IST';
    const lines: string[] = [];

    // Header
    lines.push(`🏛️ Live Market Update at ${timeStr}`);
    lines.push(''); // Line break after header

    // Indices
    const mainIndices = data.indices.slice(0, 3);
    mainIndices.forEach(index => {
      const emoji = this.getIndexEmoji(index.serviceName);
      const arrow = index.netChange >= 0 ? '▲' : '▼';
      const sign = index.percentChange >= 0 ? '+' : '-';
      lines.push(`${emoji} ${index.serviceName}: ${this.formatNumber(index.currentIndexValue)} ${arrow} ${sign}${Math.abs(index.percentChange).toFixed(2)}%`);
    });

    lines.push(''); // Line break before movers

    // Top Gainers
    if (data.topGainers.length > 0) {
      const topGainer = data.topGainers[0];
      lines.push(`📈 Top Gainer: ${topGainer.companyShortName} ▲ ${topGainer.percentChange.toFixed(2)}%`);
    }

    // Top Losers
    if (data.topLosers.length > 0) {
      const topLoser = data.topLosers[0];
      lines.push(`📉 Top Loser: ${topLoser.companyShortName} ▼ ${topLoser.percentChange.toFixed(2)}%`);
    }

    lines.push(''); // Optional: line break before hashtags

    // Hashtags
    lines.push('#Nifty50 #Sensex #MarketWatch');

    const tweet = lines.join('\n');
    logger.debug('Tweet formatted', { length: tweet.length });

    if (tweet.length > 280) {
      logger.warn('Tweet exceeds 280 characters, truncating', { originalLength: tweet.length });
      return this.truncateTweet(tweet);
    }

    logger.info('Tweet ready to post', { content: tweet });
    return tweet;
  }

  private getIndexEmoji(serviceName: string): string {
    const name = serviceName.toLowerCase();
    if (name.includes('nifty')) return '🇮🇳';
    if (name.includes('sensex')) return '🇮🇳';
    if (name.includes('bank')) return '🏦';
    return '📈';
  }

  private formatNumber(num: number): string {
    return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  private truncateTweet(tweet: string): string {
    const lines = tweet.split('\n');
    let result = '';

    for (const line of lines) {
      if ((result + line + '\n').length > 275) {
        break;
      }
      result += line + '\n';
    }

    return result.trim() + '...';
  }
}
