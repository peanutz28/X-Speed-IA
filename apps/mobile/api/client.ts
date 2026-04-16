/**
 * HTTP client for X-Speed review API
 * Handles fetch, error parsing, retries
 */

import { ENDPOINTS } from './endpoints';
import type {
  ReviewSubmissionPayload,
  ReviewSubmissionResponse,
  ApiError,
} from './types';

interface ClientOptions {
  timeout?: number;
  retries?: number;
}

const DEFAULT_OPTIONS: ClientOptions = {
  timeout: 30000,
  retries: 3,
};

class ApiClient {
  private options: ClientOptions;

  constructor(options: ClientOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Submit a review to the backend
   */
  async submitReview(
    payload: ReviewSubmissionPayload,
    retryCount = 0
  ): Promise<ReviewSubmissionResponse> {
    try {
      const response = await fetch(ENDPOINTS.submitReview, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return (await response.json()) as ReviewSubmissionResponse;
    } catch (error) {
      // Retry on network errors (not on validation errors)
      const isNetworkError =
        error instanceof TypeError ||
        (error instanceof Error && error.message.includes('fetch'));

      if (isNetworkError && retryCount < (this.options.retries || 0)) {
        console.log(
          `[ApiClient] Retry ${retryCount + 1}/${this.options.retries}`
        );
        await this.delay(1000 * Math.pow(2, retryCount)); // Exponential backoff
        return this.submitReview(payload, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Check backend health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(ENDPOINTS.health);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Helper: delay for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const apiClient = new ApiClient();
