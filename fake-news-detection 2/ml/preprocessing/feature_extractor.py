"""
feature_extractor.py
=====================
Combines text_cleaner -> tokenizer -> lemmatizer into a single
preprocessing function, and wraps scikit-learn's TfidfVectorizer so
training and inference share one code path. This is the single most
important consistency guarantee in the whole ML pipeline: if training
and serving preprocess text differently, the model's accuracy in
production silently diverges from its reported test-set accuracy.
"""

from __future__ import annotations

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer

from ml.preprocessing.text_cleaner import TextCleaner
from ml.preprocessing.tokenizer import Tokenizer
from ml.preprocessing.lemmatizer import Lemmatizer


class TextPreprocessor:
    """
    Full text -> lemmatized-token-string pipeline, used as the
    `preprocessor`-equivalent step before TF-IDF vectorization.
    """

    def __init__(self):
        self.cleaner = TextCleaner()
        self.tokenizer = Tokenizer()
        self.lemmatizer = Lemmatizer()

    def preprocess(self, text: str) -> str:
        """
        Run the full pipeline on raw text and return a space-joined
        string of lemmatized tokens, ready for TfidfVectorizer.

        Args:
            text: Raw article text (headline + body, or body only).

        Returns:
            Space-joined lemmatized tokens, e.g. "govern announce new policy".
            Returns "" for empty/invalid input.
        """
        cleaned = self.cleaner.clean(text)
        tokens = self.tokenizer.tokenize(cleaned)
        lemmas = self.lemmatizer.lemmatize_tokens(tokens)
        return " ".join(lemmas)

    def preprocess_batch(self, texts: list[str]) -> list[str]:
        """Preprocess a list of raw texts."""
        return [self.preprocess(t) for t in texts]


def build_tfidf_vectorizer(
    max_features: int = 10000,
    ngram_range: tuple[int, int] = (1, 2),
    min_df: int = 2,
    max_df: float = 0.9,
) -> TfidfVectorizer:
    """
    Construct a TfidfVectorizer with project-standard hyperparameters.

    Notes on choices:
      - max_features=10000: caps vocabulary size to keep the model small
        enough to load quickly in the API and avoid overfitting on rare
        terms in a moderately sized news dataset.
      - ngram_range=(1, 2): unigrams alone miss phrase-level signal
        (e.g. "breaking news", "fact check"); bigrams capture that
        without exploding feature count the way trigrams+ would.
      - min_df=2: drops terms that appear in only one document (likely
        noise/typos/rare proper nouns that don't generalize).
      - max_df=0.9: drops terms appearing in >90% of documents (too
        common to be discriminative, similar effect to stopwords but
        data-driven rather than a fixed list).

    Note: input to this vectorizer is expected to already be
    preprocessed text (output of TextPreprocessor.preprocess), so the
    vectorizer's own tokenizer/preprocessor are left at sklearn defaults
    (simple whitespace + token pattern split) — heavy lifting already
    happened upstream.
    """
    return TfidfVectorizer(
        max_features=max_features,
        ngram_range=ngram_range,
        min_df=min_df,
        max_df=max_df,
        sublinear_tf=True,  # log-scale term frequency, standard for text classification
    )


class FeatureExtractor:
    """
    High-level wrapper used by both training and inference:
      - fit_transform(texts) during training
      - transform(texts) during inference (uses the fitted vectorizer)
      - save/load for persisting the fitted vectorizer alongside the model
    """

    def __init__(self, vectorizer: TfidfVectorizer | None = None):
        self.preprocessor = TextPreprocessor()
        self.vectorizer = vectorizer or build_tfidf_vectorizer()
        self._is_fitted = vectorizer is not None

    def fit_transform(self, raw_texts: list[str]):
        """Preprocess and fit the TF-IDF vectorizer on training texts, returning the feature matrix."""
        preprocessed = self.preprocessor.preprocess_batch(raw_texts)
        matrix = self.vectorizer.fit_transform(preprocessed)
        self._is_fitted = True
        return matrix

    def transform(self, raw_texts: list[str]):
        """Preprocess and vectorize texts using an already-fitted vectorizer."""
        if not self._is_fitted:
            raise RuntimeError(
                "FeatureExtractor.transform() called before fitting. "
                "Call fit_transform() during training, or load() a saved vectorizer."
            )
        preprocessed = self.preprocessor.preprocess_batch(raw_texts)
        return self.vectorizer.transform(preprocessed)

    def transform_single(self, raw_text: str):
        """Convenience method for single-document inference (the live /predict endpoint)."""
        return self.transform([raw_text])

    def save(self, path: str) -> None:
        """Persist the fitted vectorizer to disk."""
        if not self._is_fitted:
            raise RuntimeError("Cannot save an unfitted vectorizer.")
        joblib.dump(self.vectorizer, path)

    @classmethod
    def load(cls, path: str) -> "FeatureExtractor":
        """Load a previously fitted vectorizer from disk."""
        vectorizer = joblib.load(path)
        return cls(vectorizer=vectorizer)

    def get_feature_names(self) -> list[str]:
        """Return the TF-IDF vocabulary, useful for model explainability/debugging."""
        if not self._is_fitted:
            raise RuntimeError("Vectorizer not fitted yet.")
        return list(self.vectorizer.get_feature_names_out())
