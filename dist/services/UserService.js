"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config/config"));
const User_1 = __importDefault(require("../models/User"));
class UserService {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }
    async fetchUsers() {
        const batchSize = config_1.default.api.requestsPerBatch;
        const requestsPerSecond = config_1.default.api.requestsPerSecond;
        const sleepTime = config_1.default.api.sleepTime;
        for (let i = 0; i < batchSize; i += requestsPerSecond) {
            const batch = Array(requestsPerSecond)
                .fill(null)
                .map(() => this.fetchUserBatch.bind(this));
            this.queue.push(...batch);
            if (!this.isProcessing) {
                this.processQueue();
            }
        }
    }
    async processQueue() {
        this.isProcessing = true;
        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, config_1.default.api.requestsPerSecond);
            await Promise.all(batch.map((request) => request()));
            await this.sleep(1000); // Wait 1 second between requests
            if (batch.length === config_1.default.api.requestsPerSecond) {
                await this.sleep(config_1.default.api.sleepTime);
            }
        }
        this.isProcessing = false;
    }
    async fetchUserBatch() {
        try {
            const response = await axios_1.default.get(`${config_1.default.api.baseUrl}`, {
                params: {
                    results: config_1.default.api.resultsPerRequest,
                },
            });
            const users = response.data.results.map(this.transformUserData);
            await User_1.default.insertMany(users);
        }
        catch (error) {
            console.error('Error fetching users:', error);
        }
    }
    transformUserData(userData) {
        return {
            id: userData.login.uuid,
            gender: userData.gender,
            name: `${userData.name.first} ${userData.name.last}`,
            address: {
                city: userData.location.city,
                state: userData.location.state,
                country: userData.location.country,
                street: `${userData.location.street.number} ${userData.location.street.name}`,
            },
            email: userData.email,
            age: userData.dob.age.toString(),
            picture: userData.picture.large,
            createdAt: new Date(),
        };
    }
    async getUsers(params) {
        const { limit = 10, page = 1, sortBy = 'createdAt', search = {} } = params;
        const query = this.buildSearchQuery(search);
        const skip = (page - 1) * limit;
        const [total, items] = await Promise.all([
            User_1.default.countDocuments(query),
            User_1.default.find(query).sort(sortBy).skip(skip).limit(limit),
        ]);
        return {
            total,
            limit,
            page,
            sortBy,
            items,
        };
    }
    buildSearchQuery(search) {
        const query = {};
        Object.entries(search).forEach(([key, value]) => {
            if (key === 'name') {
                query.$text = { $search: value };
            }
            else if (key === 'age') {
                query[key] = value;
            }
            else if (key === 'address.country') {
                query[key] = value;
            }
            else {
                query[key] = value;
            }
        });
        return query;
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.UserService = UserService;
