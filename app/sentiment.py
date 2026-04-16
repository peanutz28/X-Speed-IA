"""Deterministic sentiment analysis tuned for hospitality reviews."""

import re
from datetime import datetime
from typing import Iterable
from typing import List
from typing import Sequence
from typing import Tuple

from .models import ReviewAnalysis
from .models import ReviewInput
from .models import ReviewTags


POSITIVE_PHRASES = {
    "would stay again": 2.8,
    "highly recommend": 2.7,
    "will be back": 2.5,
    "very clean": 1.8,
    "super clean": 2.0,
    "great location": 1.8,
    "friendly staff": 1.8,
    "helpful staff": 1.8,
    "comfortable bed": 1.7,
    "good value": 1.6,
    "worth the price": 1.6,
    "excellent service": 2.1,
    "loved the stay": 2.5,
    "really enjoyed": 2.0,
}

NEGATIVE_PHRASES = {
    "not clean": -2.6,
    "very dirty": -2.8,
    "super dirty": -3.0,
    "broken shower": -2.7,
    "broken ac": -3.0,
    "air conditioning broken": -3.0,
    "not working": -2.2,
    "did not work": -2.3,
    "no hot water": -3.1,
    "too noisy": -2.0,
    "very noisy": -2.2,
    "paper thin walls": -2.4,
    "rude staff": -2.5,
    "would not stay again": -3.0,
    "not worth": -2.4,
    "poor service": -2.5,
    "terrible service": -3.0,
    "bad experience": -2.6,
    "room smelled": -2.3,
    "wifi was unreliable": -2.2,
    "wi fi was unreliable": -2.2,
    "unreliable wifi": -2.2,
    "dirty room": -2.6,
}

POSITIVE_WORDS = {
    "amazing": 2.2,
    "awesome": 2.0,
    "clean": 1.2,
    "comfortable": 1.3,
    "convenient": 1.1,
    "decent": 0.6,
    "delightful": 2.0,
    "easy": 0.8,
    "enjoyed": 1.7,
    "excellent": 2.3,
    "friendly": 1.4,
    "good": 1.0,
    "great": 1.8,
    "helpful": 1.4,
    "impressed": 1.9,
    "love": 2.1,
    "loved": 2.2,
    "nice": 0.9,
    "perfect": 2.4,
    "pleasant": 1.1,
    "quiet": 1.0,
    "recommend": 1.8,
    "spacious": 1.3,
    "wonderful": 2.3,
}

NEGATIVE_WORDS = {
    "awful": -2.8,
    "bad": -1.5,
    "broken": -2.4,
    "cold": -0.7,
    "dated": -0.8,
    "dirty": -2.5,
    "disappointing": -2.1,
    "disappointed": -2.0,
    "filthy": -3.0,
    "frustrating": -2.0,
    "issue": -1.2,
    "issues": -1.3,
    "loud": -1.5,
    "mediocre": -1.1,
    "mold": -2.8,
    "noisy": -1.7,
    "poor": -1.8,
    "problem": -1.4,
    "problems": -1.5,
    "rude": -2.2,
    "slow": -1.2,
    "smelled": -1.8,
    "smelly": -2.0,
    "terrible": -2.9,
    "unacceptable": -2.8,
    "uncomfortable": -1.7,
    "unreliable": -1.9,
    "worst": -3.0,
}

NEGATIONS = {
    "aint",
    "barely",
    "didnt",
    "doesnt",
    "dont",
    "hardly",
    "isnt",
    "never",
    "no",
    "none",
    "not",
    "wasnt",
    "without",
    "wont",
    "wouldnt",
}

INTENSIFIERS = {
    "absolutely": 1.35,
    "extremely": 1.4,
    "incredibly": 1.35,
    "really": 1.2,
    "so": 1.15,
    "super": 1.35,
    "too": 1.15,
    "totally": 1.25,
    "very": 1.3,
}

DIMINISHERS = {
    "a bit": 0.75,
    "fairly": 0.85,
    "kind of": 0.75,
    "kinda": 0.75,
    "pretty": 0.9,
    "slightly": 0.7,
    "somewhat": 0.8,
}

CONTRAST_WORDS = {"but", "however", "though", "although", "yet"}

EXCLAMATION_BONUS = 0.15


class DeterministicSentimentAnalyzer:
    """Scores review sentiment without calling an LLM."""

    def analyze(self, review: ReviewInput, tags: ReviewTags) -> ReviewAnalysis:
        score, label = _score_sentiment(review.content)
        return ReviewAnalysis(
            sentiment_label=label,
            sentiment_score=score,
            review_tag=tags.review_tag,
            recent_review=_is_recent_review(review.review_date),
        )


def _score_sentiment(text: str) -> Tuple[float, str]:
    if not text.strip():
        return 0.0, "neutral"

    normalized_text = _normalize_text(text)
    sentence_scores = []
    weighted_total = 0.0
    total_weight = 0.0

    for sentence in _split_sentences(normalized_text):
        sentence_score = _score_sentence(sentence)
        sentence_scores.append(sentence_score)
        weight = 1.0 + min(0.35, sentence.count("!") * EXCLAMATION_BONUS)
        weighted_total += sentence_score * weight
        total_weight += weight

    if total_weight == 0:
        return 0.0, "neutral"

    raw_score = weighted_total / total_weight
    if any(word in normalized_text.split() for word in ("broken", "filthy", "worst")):
        raw_score -= 0.15
    if "would stay again" in normalized_text or "highly recommend" in normalized_text:
        raw_score += 0.12
    if _has_positive_evidence(normalized_text) and _has_negative_evidence(normalized_text):
        raw_score *= 0.6

    score = max(-1.0, min(1.0, round(raw_score / 4.0, 2)))
    label = _label_score(score, sentence_scores, normalized_text)
    return score, label


def _score_sentence(sentence: str) -> float:
    tokens = _tokenize(sentence)
    if not tokens:
        return 0.0

    phrase_score = _score_phrases(sentence)
    token_score = 0.0
    for index, token in enumerate(tokens):
        if token not in POSITIVE_WORDS and token not in NEGATIVE_WORDS:
            continue

        base = POSITIVE_WORDS.get(token, NEGATIVE_WORDS.get(token, 0.0))
        modifier = _modifier_multiplier(tokens, index)
        if _is_negated(tokens, index):
            base *= -0.9
        token_score += base * modifier

    total = phrase_score + token_score
    if _contains_contrast(tokens):
        total = _apply_contrast_weighting(sentence)
    return total


def _score_phrases(sentence: str) -> float:
    score = 0.0
    for phrase, value in POSITIVE_PHRASES.items():
        if phrase in sentence:
            score += value
    for phrase, value in NEGATIVE_PHRASES.items():
        if phrase in sentence:
            score += value
    return score


def _apply_contrast_weighting(sentence: str) -> float:
    parts = re.split(r"\b(?:but|however|though|although|yet)\b", sentence)
    if len(parts) < 2:
        return _score_clause(sentence)

    weighted_score = 0.0
    total_weight = 0.0
    for index, part in enumerate(parts):
        part = part.strip()
        if not part:
            continue
        weight = 0.8 if index == 0 else 1.25 + (0.1 * index)
        weighted_score += _score_clause(part) * weight
        total_weight += weight
    if total_weight == 0:
        return 0.0
    return weighted_score / total_weight


def _score_clause(clause: str) -> float:
    tokens = _tokenize(clause)
    if not tokens:
        return 0.0

    score = _score_phrases(clause)
    for index, token in enumerate(tokens):
        if token not in POSITIVE_WORDS and token not in NEGATIVE_WORDS:
            continue
        base = POSITIVE_WORDS.get(token, NEGATIVE_WORDS.get(token, 0.0))
        modifier = _modifier_multiplier(tokens, index)
        if _is_negated(tokens, index):
            base *= -0.9
        score += base * modifier
    return score


def _modifier_multiplier(tokens: Sequence[str], index: int) -> float:
    multiplier = 1.0
    start = max(0, index - 2)
    context = tokens[start:index]
    context_text = " ".join(context)

    for phrase, value in DIMINISHERS.items():
        if phrase in context_text:
            multiplier *= value
    for token in context:
        multiplier *= INTENSIFIERS.get(token, 1.0)
    return multiplier


def _is_negated(tokens: Sequence[str], index: int) -> bool:
    start = max(0, index - 3)
    context = tokens[start:index]
    return any(token in NEGATIONS for token in context)


def _contains_contrast(tokens: Sequence[str]) -> bool:
    return any(token in CONTRAST_WORDS for token in tokens)


def _split_sentences(text: str) -> List[str]:
    sentences = [segment.strip() for segment in re.split(r"[.!?]+", text) if segment.strip()]
    return sentences or [text]


def _tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower())


def _normalize_text(text: str) -> str:
    normalized = text.lower()
    normalized = normalized.replace("wi-fi", "wifi")
    normalized = normalized.replace("wi fi", "wifi")
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.strip()


def _label_score(score: float, sentence_scores: Sequence[float], normalized_text: str) -> str:
    has_positive = (
        any(value >= 1.0 for value in sentence_scores)
        or score >= 0.3
        or _has_positive_evidence(normalized_text)
    )
    has_negative = (
        any(value <= -1.0 for value in sentence_scores)
        or score <= -0.3
        or _has_negative_evidence(normalized_text)
    )

    if has_positive and has_negative:
        if score >= 0.65:
            return "positive"
        if score <= -0.65:
            return "negative"
        return "mixed"
    if score >= 0.2:
        return "positive"
    if score <= -0.2:
        return "negative"
    return "neutral"


def _has_positive_evidence(normalized_text: str) -> bool:
    tokens = _tokenize(normalized_text)
    if any(phrase in normalized_text for phrase in POSITIVE_PHRASES):
        return True
    for index, token in enumerate(tokens):
        if token in POSITIVE_WORDS and not _is_negated(tokens, index):
            return True
    return False


def _has_negative_evidence(normalized_text: str) -> bool:
    tokens = _tokenize(normalized_text)
    if any(phrase in normalized_text for phrase in NEGATIVE_PHRASES):
        return True
    for index, token in enumerate(tokens):
        if token in NEGATIVE_WORDS:
            return True
        if token in POSITIVE_WORDS and _is_negated(tokens, index):
            return True
    return False


def _is_recent_review(review_date: str) -> bool:
    try:
        parsed_date = datetime.strptime(review_date, "%Y-%m-%d").date()
    except ValueError:
        return False
    return (datetime.utcnow().date() - parsed_date).days <= 90
