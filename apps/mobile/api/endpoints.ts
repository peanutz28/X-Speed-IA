/**
 * API endpoint configuration
 *
 * For local development: http://127.0.0.1:8000
 * For production: deploy Python backend and update BASE_URL
 */

// TODO: Update this to production URL when backend is deployed
export const API_BASE_URL = 'http://127.0.0.1:8000';

export const ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  submitReview: `${API_BASE_URL}/reviews`,
  listActionableItems: `${API_BASE_URL}/actionable-items`,
  resolveActionableItem: (id: number) => `${API_BASE_URL}/actionable-items/${id}/resolve`,
};
