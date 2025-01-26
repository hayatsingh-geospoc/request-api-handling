import axios from 'axios';
import config from '../config/config';
import User from '../models/User';
import { IItems, IPagination } from '../interfaces/user.interface';

export class UserService {
  private queue: (() => Promise<void>)[] = [];
  private isProcessing = false;

  async fetchUsers(): Promise<void> {
    const batchSize = config.api.requestsPerBatch;
    const requestsPerSecond = config.api.requestsPerSecond;
    const sleepTime = config.api.sleepTime;

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

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, config.api.requestsPerSecond);
      await Promise.all(batch.map((request) => request()));
      await this.sleep(1000); // Wait 1 second between requests

      if (batch.length === config.api.requestsPerSecond) {
        await this.sleep(config.api.sleepTime);
      }
    }

    this.isProcessing = false;
  }

  private async fetchUserBatch(): Promise<void> {
    try {
      const response = await axios.get(`${config.api.baseUrl}`, {
        params: {
          results: config.api.resultsPerRequest,
        },
      });

      const users = response.data.results.map(this.transformUserData);
      await User.insertMany(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  private transformUserData(userData: any): IItems {
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

  async getUsers(params: {
    limit?: number;
    page?: number;
    sortBy?: string;
    search?: Record<string, any>;
  }): Promise<IPagination> {
    const { limit = 10, page = 1, sortBy = 'createdAt', search = {} } = params;

    const query = this.buildSearchQuery(search);
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort(sortBy).skip(skip).limit(limit),
    ]);

    return {
      total,
      limit,
      page,
      sortBy,
      items,
    };
  }

  private buildSearchQuery(search: Record<string, any>): Record<string, any> {
    const query: Record<string, any> = {};

    Object.entries(search).forEach(([key, value]) => {
      if (key === 'name') {
        query.$text = { $search: value };
      } else if (key === 'age') {
        query[key] = value;
      } else if (key === 'address.country') {
        query[key] = value;
      } else {
        query[key] = value;
      }
    });

    return query;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
