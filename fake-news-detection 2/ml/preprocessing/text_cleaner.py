"""
text_cleaner.py
================
Cleans raw news article text before it is fed into tokenization and
vectorization. Handles the noise patterns typical of scraped news text:
HTML remnants, URLs, social media artifacts, punctuation, and casing.

Used identically at training time (ml/training/train.py) and inference
time (backend prediction service) to guarantee train/serve consistency.
"""

import re
import unicodedata


class TextCleaner:
    """Deterministic, stateless text-cleaning pipeline for news articles."""

    # Compiled once at import time for performance — this matters because
    # cleaning runs on every training row (tens of thousands) and on every
    # live prediction request.
    _URL_PATTERN = re.compile(r"https?://\S+|www\.\S+")
    _EMAIL_PATTERN = re.compile(r"\S+@\S+\.\S+")
    _HTML_TAG_PATTERN = re.compile(r"<.*?>")
    _HTML_ENTITY_PATTERN = re.compile(r"&[a-zA-Z]+;|&#\d+;")
    _MENTION_HASHTAG_PATTERN = re.compile(r"[@#]\w+")
    _NON_ALPHA_PATTERN = re.compile(r"[^a-zA-Z\s]")
    _MULTI_SPACE_PATTERN = re.compile(r"\s+")
    _REPEATED_CHAR_PATTERN = re.compile(r"(.)\1{2,}")  # "soooo" -> "soo"

    def __init__(
        self,
        lowercase: bool = True,
        remove_urls: bool = True,
        remove_html: bool = True,
        remove_emails: bool = True,
        remove_mentions_hashtags: bool = True,
        remove_punctuation: bool = True,
        normalize_unicode: bool = True,
        collapse_repeated_chars: bool = True,
        min_length: int = 3,
    ):
        self.lowercase = lowercase
        self.remove_urls = remove_urls
        self.remove_html = remove_html
        self.remove_emails = remove_emails
        self.remove_mentions_hashtags = remove_mentions_hashtags
        self.remove_punctuation = remove_punctuation
        self.normalize_unicode = normalize_unicode
        self.collapse_repeated_chars = collapse_repeated_chars
        self.min_length = min_length

    def clean(self, text: str) -> str:
        """
        Run the full cleaning pipeline on a single text string.

        Args:
            text: Raw article text.

        Returns:
            Cleaned text, lowercased and stripped of noise. Returns an
            empty string for None/non-string/too-short input rather than
            raising, so batch pipelines (pandas .apply) don't crash on
            a single malformed row.
        """
        if not isinstance(text, str) or len(text.strip()) < self.min_length:
            return ""

        if self.normalize_unicode:
            # Decompose accented characters (e.g. café -> cafe) for a
            # consistent vocabulary across encodings.
            text = unicodedata.normalize("NFKD", text)
            text = text.encode("ascii", "ignore").decode("utf-8", "ignore")

        if self.remove_html:
            text = self._HTML_TAG_PATTERN.sub(" ", text)
            text = self._HTML_ENTITY_PATTERN.sub(" ", text)

        if self.remove_urls:
            text = self._URL_PATTERN.sub(" ", text)

        if self.remove_emails:
            text = self._EMAIL_PATTERN.sub(" ", text)

        if self.remove_mentions_hashtags:
            text = self._MENTION_HASHTAG_PATTERN.sub(" ", text)

        if self.lowercase:
            text = text.lower()

        if self.collapse_repeated_chars:
            text = self._REPEATED_CHAR_PATTERN.sub(r"\1\1", text)

        if self.remove_punctuation:
            text = self._NON_ALPHA_PATTERN.sub(" ", text)

        # Collapse whitespace runs and trim — always last.
        text = self._MULTI_SPACE_PATTERN.sub(" ", text).strip()

        return text

    def clean_batch(self, texts: list[str]) -> list[str]:
        """Clean a list of texts. Convenience wrapper for pandas/list pipelines."""
        return [self.clean(t) for t in texts]


# Module-level singleton with default settings for simple imports, e.g.:
#   from ml.preprocessing.text_cleaner import clean_text
_default_cleaner = TextCleaner()


def clean_text(text: str) -> str:
    """Convenience function using default TextCleaner settings."""
    return _default_cleaner.clean(text)
