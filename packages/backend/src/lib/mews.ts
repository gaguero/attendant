// packages/backend/src/lib/mews.ts
import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { mewsConfig } from '../config';
import { logger } from './logger';

// Simple in-memory rate limiter
const RATE_LIMIT_COUNT = 500;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
let requestTimestamps: number[] = [];

const rateLimiter = async () => {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (requestTimestamps.length >= RATE_LIMIT_COUNT) {
    const timeToWait = RATE_LIMIT_WINDOW - (now - (requestTimestamps[0] || now));
    logger.warn(`Mews API rate limit reached. Waiting for ${timeToWait}ms`);
    await new Promise((resolve) => setTimeout(resolve, timeToWait));
  }

  requestTimestamps.push(now);
};

class MewsClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.mews-demo.com',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.initializeInterceptors();
    this.initializeRetry();
  }

  private initializeInterceptors() {
    this.client.interceptors.request.use(
      async (request) => {
        await rateLimiter();
        request.headers['Authorization'] = `Bearer ${mewsConfig.accessToken}`;
        return request;
      },
      (error) => {
        logger.error('Mews API request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        logger.error('Mews API response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  private initializeRetry() {
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: (retryCount) => {
        logger.info(`Mews API request failed. Retry attempt: ${retryCount}`);
        return retryCount * 2000; // 2s, 4s, 6s
      },
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 503
        );
      },
    });
  }

  public async get(path: string, params = {}) {
    return this.client.get(path, { params });
  }

  public async post(path: string, data = {}) {
    return this.client.post(path, data);
  }
}

export const mewsClient = new MewsClient();
