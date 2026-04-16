/**
 * Typed interfaces for X-Speed review API
 */

export type ReviewVerdict = 'like' | 'dislike' | 'na';

export interface ReviewAnalysis {
  sentiment_label: string;
  sentiment_score: number;
  review_tag: string;
  recent_review: boolean;
}

export interface StoredReview {
  id: number;
  created_at: string;
  analysis: ReviewAnalysis;
  user_name: string;
  user_profile_photo_url: string;
  content: string;
  review_date: string;
  property_name: string;
  amenities: string[];
  verdicts: Record<string, ReviewVerdict>;
  followup_answers: Record<string, string[]>;
  voice_note_url: string | null;
}

export interface ActionableItem {
  id: number;
  canonical_text: string;
  category: 'major' | 'minor';
  dedupe_key: string;
  status: 'open' | 'resolved';
  created_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  listing_update_text: string | null;
  listing_updated_at: string | null;
  linked_review_ids: number[];
}

export interface HiddenGemAmenity {
  amenity: string;
  mention_count: number;
  total_reviews: number;
  mention_rate: number;
  hidden_gem: boolean;
}

export interface ReviewSubmissionPayload {
  user_name: string;
  user_profile_photo_url: string;
  content: string;
  review_date: string;
  property_name: string;
  amenities?: string[];
  verdicts?: Record<string, ReviewVerdict>;
  followup_answers?: Record<string, string[]>;
  voice_note_url?: string;
}

export interface ReviewSubmissionResponse {
  review: StoredReview;
  actionable_items: ActionableItem[];
  hidden_gem_amenities?: HiddenGemAmenity[];
}

export interface ApiError {
  error: string;
  missing_fields?: string[];
}
