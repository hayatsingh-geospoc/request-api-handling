export interface IApiConfig {
  baseUrl: string;
  resultsPerRequest: number;
  requestsPerSecond: number;
  sleepTime: number;
  requestsPerBatch: number;
  batchSleepTime: number;
}

export interface IConfig {
  api: IApiConfig;
  mongodb: {
    uri: string;
    options: {
      useNewUrlParser: boolean;
      useUnifiedTopology: boolean;
    };
  };
}

const config: IConfig = {
  api: {
    baseUrl: 'https://randomuser.me/api',
    resultsPerRequest: 5000,
    requestsPerSecond: 5,
    sleepTime: 30000, // 30 seconds
    requestsPerBatch: 300,
    batchSleepTime: 1000, // 1 second between batches
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/user-service',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
};

export default config;
