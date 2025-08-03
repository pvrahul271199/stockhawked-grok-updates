import 'dotenv/config';
import express from 'express';
import logger from './utils/logger.js';
import { TwitterClient } from './clients/twitterClient.js';
import { Scheduler } from './services/scheduler.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Global error handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

// Initialize services
let scheduler: Scheduler;
let twitterClient: TwitterClient;
let startTime: Date;

async function initializeApp(): Promise<void> {
  try {
    logger.info('Initializing Market Snapshot Bot...');
    
    // Initialize services
    twitterClient = new TwitterClient();
    logger.info('check 1');
    scheduler = new Scheduler();
    startTime = new Date();

    // Verify Twitter credentials
    const credentialsValid = await twitterClient.verifyCredentials();
    if (!credentialsValid) {
      throw new Error('Twitter credentials verification failed');
    }
    logger.info('Twitter credentials verified successfully');
    
    logger.info('Services initialized successfully');
    
  } catch (error) {
    logger.error('Failed to initialize app', { error: (error as Error).message });
    process.exit(1);
  }
}

// Health check endpoint
app.get('/health', (_, res) => {
  const uptime = Date.now() - startTime.getTime();
  const schedulerStatus = scheduler?.getStatus() || { isRunning: false };
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime / 1000),
    version: '1.0.0',
    scheduler: schedulerStatus
  });
});

// Manual trigger endpoint (for testing)
app.post('/trigger', async (_, res) => {
  try {
    logger.info('Manual trigger requested via API');
    await scheduler.triggerManually();
    res.json({ message: 'Task triggered successfully' });
  } catch (error) {
    logger.error('Manual trigger failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Task trigger failed' });
  }
});

// Start server
async function startServer(): Promise<void> {
  await initializeApp();
  
  // Start scheduler
  scheduler.start();
  
  // Start HTTP server
  app.listen(port, () => {
    logger.info(`Market Snapshot Bot started successfully`, { 
      port,
      environment: process.env.NODE_ENV || 'development'
    });
  });
}

// Start the application
startServer().catch((error) => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});
