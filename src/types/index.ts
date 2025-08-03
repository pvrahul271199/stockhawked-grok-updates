export interface IndexData {
  serviceName: string;
  currentIndexValue: number;
  netChange: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  dateTime: string;
}

export interface StockData {
  companyShortName: string;
  current: number;
  netChange: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
}

export interface MarketData {
  isMarketOpen: boolean;
  indices: IndexData[];
  topGainers: StockData[];
  topLosers: StockData[];
}
