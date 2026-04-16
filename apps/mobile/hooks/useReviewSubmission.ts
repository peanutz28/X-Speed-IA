/**
 * Hook for managing review submission state and logic
 */

import { useState, useCallback } from 'react';
import { submitReview } from '@/services/review.service';
import type {
  ReviewSubmissionResponse,
  ReviewVerdict,
} from '@/api/types';

interface UseReviewSubmissionState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseReviewSubmissionActions {
  submit: (payload: {
    stayId: string;
    propertyName: string;
    verdicts: Record<string, ReviewVerdict>;
    followupAnswers: Record<string, string[]>;
    voiceNoteUri?: string;
    userProfile: { name: string; photoUrl: string };
  }) => Promise<ReviewSubmissionResponse>;
  reset: () => void;
}

export function useReviewSubmission(): UseReviewSubmissionState & UseReviewSubmissionActions {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await submitReview(payload);
        setSuccess(true);
        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to submit review';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    submit,
    reset,
  };
}
