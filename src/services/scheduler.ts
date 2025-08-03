import cron from 'node-cron';
import moment from 'moment-timezone';
import logger from '../utils/logger.js';
import { MarketFetcher } from './marketFetcher.js';
import { TweetFormatter } from './tweetFormatter.js';
import { TwitterClient } from '../clients/twitterClient.js';

export class Scheduler {
  private marketFetcher: MarketFetcher;
  private tweetFormatter: TweetFormatter;
  private twitterClient: TwitterClient;
  private task: cron.ScheduledTask | null = null;
  private lastTweetTime: string | null = null;

  constructor() {
    this.marketFetcher = new MarketFetcher();
    this.tweetFormatter = new TweetFormatter();
    this.twitterClient = new TwitterClient();
  }

  start(): void {
    // Run every 20 minutes during market hours (9:15 AM - 3:30 PM IST, Mon-Fri)
    // const cronExpression = '*/20 9-15 * * 1-5';
    const cronExpression = "* * * * *";
    
    logger.info('Starting scheduler', { cronExpression });
    
    this.task = cron.schedule(cronExpression, async () => {
      await this.executeTask();
    }, {
      scheduled: false,
      timezone: process.env.TIMEZONE || 'Asia/Kolkata'
    });

    this.task.start();
    logger.info('Scheduler started successfully');
  }

  private async executeTask(): Promise<void> {
    try {
      logger.info('Executing scheduled market snapshot task');
      
      // Check if it's actually market hours
      if (false) { // !this.isMarketHours(
        logger.info('Outside market hours, skipping task');
        return;
      }

      // Fetch market data
      const marketData = await this.marketFetcher.fetchMarketSnapshot();
      
      // Check if market is open according to API
      if (false) { //!marketData.isMarketOpen
        logger.info('Market is closed according to API, skipping tweet');
        return;
      }

      // Format tweet
      const tweetContent = this.tweetFormatter.formatMarketSnapshot(marketData);
      console.log("tweetContent check", tweetContent);
      // Post tweet
      await this.twitterClient.postTweet(tweetContent);
      
      this.lastTweetTime = moment().tz('Asia/Kolkata').format();
      logger.info('Market snapshot task completed successfully');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Market snapshot task failed', { error: errorMsg });
    }
  }

  private isMarketHours(): boolean {
    const now = moment().tz('Asia/Kolkata');
    const dayOfWeek = now.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Check if it's a weekday (Monday to Friday)
    if (dayOfWeek < 1 || dayOfWeek > 5) {
      return false;
    }
    
    const currentHour = now.hour();
    const currentMinute = now.minute();
    const currentTime = currentHour * 60 + currentMinute;
    
    const marketStart = 9 * 60 + 15; // 9:15 AM
    const marketEnd = 15 * 60 + 30;  // 3:30 PM
    
    return currentTime >= marketStart && currentTime <= marketEnd;
  }

  // Manual trigger for testing
  async triggerManually(): Promise<void> {
    logger.info('Manual trigger requested');
    await this.executeTask();
  }

  getStatus() {
    return {
      isRunning: this.task !== null,
      lastTweetTime: this.lastTweetTime,
      nextRun: this.task ? 'Next 20-minute interval during market hours' : null
    };
  }
}
