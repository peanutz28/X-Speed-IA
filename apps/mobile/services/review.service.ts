/**
 * Review submission service
 * Handles converting app state to API payload
 */

import { apiClient } from '@/api/client';
import type {
  ReviewSubmissionPayload,
  ReviewSubmissionResponse,
  ReviewVerdict,
} from '@/api/types';

interface ReviewDraft {
  stayId: string;
  propertyName: string;
  verdicts: Record<string, ReviewVerdict>;
  followupAnswers: Record<string, string[]>;
  voiceNoteUri?: string;
  userProfile: {
    name: string;
    photoUrl: string;
  };
}

/**
 * Convert app review draft to API payload
 */
export function draftToPayload(draft: ReviewDraft): ReviewSubmissionPayload {
  // Generate a summary comment from verdicts
  const verdictSummaries = Object.entries(draft.verdicts).map(
    ([category, verdict]) => `${category}: ${verdict}`
  );
  const content =
    verdictSummaries.join(', ') ||
    'Review submitted from mobile app';

  const payload: ReviewSubmissionPayload = {
    user_name: draft.userProfile.name,
    user_profile_photo_url: draft.userProfile.photoUrl,
    content,
    review_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    property_name: draft.propertyName,
    verdicts: draft.verdicts,
    followup_answers: draft.followupAnswers,
  };

  if (draft.voiceNoteUri) {
    payload.voice_note_url = draft.voiceNoteUri;
  }

  return payload;
}

/**
 * Submit a review to the backend
 */
export async function submitReview(
  draft: ReviewDraft
): Promise<ReviewSubmissionResponse> {
  const payload = draftToPayload(draft);
  return apiClient.submitReview(payload);
}

/**
 * Convert voice file URI to base64 (optional, for embedding in POST)
 * For now, we just pass the URI as-is
 */
export async function encodeVoiceNote(uri: string): Promise<string> {
  // TODO: Implement base64 encoding if needed
  // For now, just return the URI - the app can upload elsewhere
  return uri;
}
