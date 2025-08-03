# Market Snapshot Bot

A production-ready Node.js application that automatically posts Indian stock market snapshots to Twitter every 20 minutes during market hours (9:15 AM - 3:30 PM IST, weekdays).

## Features

- 📊 Fetches real-time market data from Indian stock market API
- 🐦 Posts formatted tweets with market snapshots
- ⏰ Automated scheduling during market hours only
- 🔄 Retry logic with exponential backoff for API failures
- 🏥 Health check endpoint for monitoring
- 📝 Structured JSON logging
- 🐳 Docker containerization
- ✅ Unit tests with Jest

## Sample Tweet Format

```
📊 Market Snapshot – 2:30 PM IST
🇮🇳 Nifty: 22,395 ▼ -0.25%  
📈 Sensex: 74,010 ▼ -0.30%  
🏦 Bank Nifty: 47,820 ▲ +0.18%
🚀 Top Gainers: HCLTech +2.1%, Bajaj Auto +1.8%  
🔻 Top Losers: ITC -1.5%, Hindalco -1.2%
#Nifty50 #Sensex #StockMarketIndia #MarketLive
```

## Prerequisites

- Node.js 18+ 
- Twitter Developer Account with API credentials
- Access to the market data API

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd market-snapshot-bot
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Market API
MARKET_API_URL=http://lsoksk04gw8coogskks4coco.188.245.217.56.sslip.io/api/market-band

# Twitter API Credentials
TWITTER_APP_KEY=your_twitter_app_key_here
TWITTER_APP_SECRET=your_twitter_app_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_SECRET=your_twitter_access_secret_here

# Configuration
TIMEZONE=Asia/Kolkata
LOG_LEVEL=info
PORT=3000
```

### 3. Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production build
npm start
```

### 4. Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Docker Deployment

### Build and Run

```bash
# Build Docker image
npm run docker:build

# Run with Docker
npm run docker:run

# Or use Docker Compose
docker-compose up -d
```

### Production Deployment

```bash
# Production build with Docker Compose
docker-compose -f docker-compose.yml up -d --build
```

## API Endpoints

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-03T09:15:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "scheduler": {
    "isRunning": true,
    "lastTweetTime": "2025-08-03T09:15:00.000Z"
  }
}
```

### Manual Trigger (Testing)
```http
POST /trigger
```

## Architecture

```
src/
├── index.ts              # Application entry point
├── types/
│   └── index.ts          # TypeScript interfaces
├── utils/
│   └── logger.ts         # Winston logger configuration
├── clients/
│   └── twitterClient.ts  # Twitter API client
└── services/
    ├── marketFetcher.ts  # Fetches market data
    ├── tweetFormatter.ts # Formats tweets
    └── scheduler.ts      # Handles scheduling
```

## Configuration

The app uses environment variables with sensible defaults:

- **MARKET_API_URL**: Market data API endpoint
- **TWITTER_***: Twitter API credentials
- **TIMEZONE**: Default `Asia/Kolkata`
- **LOG_LEVEL**: Default `info`
- **PORT**: Default `3000`

## Scheduling

- Runs every 20 minutes during market hours
- Market hours: 9:15 AM - 3:30 PM IST
- Only on weekdays (Monday-Friday)
- Automatically skips when market is closed

## Error Handling

- Retry logic with exponential backoff for API failures
- Comprehensive error logging
- Graceful degradation when services are unavailable
- Health checks for monitoring

## Monitoring

- Health check endpoint at `/health`
- Structured JSON logging
- Docker health checks
- Process monitoring with PM2 (optional)

## Logging

All logs are in JSON format for easy ingestion:

```json
{
  "timestamp": "2025-08-03T09:15:00.000Z",
  "level": "info",
  "message": "Tweet posted successfully",
  "service": "market-snapshot-bot",
  "tweetId": "1234567890"
}
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Production Considerations

- Use process manager like PM2 for production
- Set up log rotation
- Monitor health check endpoint
- Configure proper Twitter API rate limits
- Set up alerting for failures

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please create an issue in the repository.
