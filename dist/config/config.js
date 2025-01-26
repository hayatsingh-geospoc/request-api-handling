"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
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
exports.default = config;
