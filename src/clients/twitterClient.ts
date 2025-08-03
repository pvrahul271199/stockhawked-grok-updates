import { TwitterApi } from 'twitter-api-v2';
import logger from '../utils/logger.js';

export class TwitterClient {
  private client: TwitterApi;

  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_APP_KEY!,
      appSecret: process.env.TWITTER_APP_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
  }

  async postTweet(content: string): Promise<{ id: string; text: string }> {
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Posting tweet (attempt ${attempt}/${maxRetries})`, { 
          contentLength: content.length
        });

        const response = await this.client.v2.tweet({ text: content });

        logger.info('Tweet posted successfully', { 
          tweetId: response.data.id
        });

        return {
          id: response.data.id,
          text: response.data.text
        };
      } catch (error) {
        console.log("error check",error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Tweet post attempt ${attempt} failed: ${errorMsg}`);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to post tweet after ${maxRetries} attempts: ${errorMsg}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
    
    throw new Error('All retry attempts exhausted');
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      const user = await this.client.v2.me();
      logger.info('Twitter credentials verified', { 
        userId: user.data.id,
        username: user.data.username
      });
      return true;
    } catch (error) {
      logger.error('Twitter credentials verification failed', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}
