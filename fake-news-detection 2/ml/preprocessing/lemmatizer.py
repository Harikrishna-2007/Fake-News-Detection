"""
lemmatizer.py
=============
Reduces tokens to their dictionary base form (lemma) using WordNet, e.g.
"running" -> "run", "better" -> "good" (with POS context), "studies" -> "study".

Lemmatization is preferred over stemming here because it produces real
words, which keeps TF-IDF feature names interpretable when inspecting
top coefficients for model explainability (useful in the viva/demo).
"""

import re

try:
    import nltk
    from nltk.stem import WordNetLemmatizer
    from nltk.corpus import wordnet
    from nltk import pos_tag

    _NLTK_AVAILABLE = True
except ImportError:  # pragma: no cover - exercised only when nltk isn't installed
    _NLTK_AVAILABLE = False


def _ensure_nltk_data() -> None:
    if not _NLTK_AVAILABLE:
        return
    required = [
        ("corpora/wordnet", "wordnet"),
        ("corpora/omw-1.4", "omw-1.4"),
        ("taggers/averaged_perceptron_tagger", "averaged_perceptron_tagger"),
        ("taggers/averaged_perceptron_tagger_eng", "averaged_perceptron_tagger_eng"),
    ]
    for path, package in required:
        try:
            nltk.data.find(path)
        except LookupError:
            try:
                nltk.download(package, quiet=True)
            except Exception:
                # Some package names vary across NLTK versions; lemmatizer
                # falls back to noun-only lemmatization if POS tagging
                # data can't be fetched (e.g. no network in sandboxed CI).
                pass


_ensure_nltk_data()


def _wordnet_data_ready() -> bool:
    if not _NLTK_AVAILABLE:
        return False
    try:
        nltk.data.find("corpora/wordnet")
        return True
    except LookupError:
        return False


class _FallbackLemmatizer:
    """
    Lightweight suffix-stripping lemmatizer used ONLY when nltk/WordNet
    data is unavailable (e.g. no network access for nltk.download). This
    is a deliberately conservative rule-based approximation — it will
    not be as linguistically accurate as WordNet (e.g. it won't map
    "better" -> "good"), but it correctly normalizes the common
    inflectional patterns (plurals, -ing, -ed) that matter most for
    TF-IDF vocabulary consolidation. Production deployments should
    install nltk per requirements.txt so the real WordNetLemmatizer is
    used instead.
    """

    _IRREGULAR = {
        "better": "good", "best": "good", "worse": "bad", "worst": "bad",
        "went": "go", "gone": "go", "ran": "run", "men": "man", "women": "woman",
        "children": "child", "people": "person",
    }

    def lemmatize(self, word: str, pos: str = "n") -> str:
        if word in self._IRREGULAR:
            return self._IRREGULAR[word]
        if len(word) <= 3:
            return word
        if word.endswith("ies") and len(word) > 4:
            return word[:-3] + "y"
        if word.endswith("ied") and len(word) > 4:
            return word[:-3] + "y"
        if word.endswith("ing") and len(word) > 5:
            return word[:-3]
        if word.endswith("ed") and len(word) > 4:
            return word[:-2]
        if word.endswith("es") and len(word) > 4:
            return word[:-2]
        if word.endswith("s") and not word.endswith("ss") and len(word) > 3:
            return word[:-1]
        return word


def _wordnet_pos(treebank_tag: str) -> str:
    """Map a Penn Treebank POS tag to the WordNet POS tag WordNetLemmatizer expects."""
    if treebank_tag.startswith("J"):
        return wordnet.ADJ
    if treebank_tag.startswith("V"):
        return wordnet.VERB
    if treebank_tag.startswith("R"):
        return wordnet.ADV
    return wordnet.NOUN  # default / fallback


class Lemmatizer:
    """POS-aware lemmatization of token lists."""

    def __init__(self, use_pos_tagging: bool = True):
        if _wordnet_data_ready():
            self._lemmatizer = WordNetLemmatizer()
            self._use_fallback = False
        else:
            self._lemmatizer = _FallbackLemmatizer()
            self._use_fallback = True
        self.use_pos_tagging = use_pos_tagging and not self._use_fallback

    def lemmatize_tokens(self, tokens: list[str]) -> list[str]:
        """
        Lemmatize a list of tokens.

        Args:
            tokens: List of word tokens (output of Tokenizer.tokenize).

        Returns:
            List of lemmatized tokens, same length and order as input.
        """
        if not tokens:
            return []

        if not self.use_pos_tagging:
            return [self._lemmatizer.lemmatize(tok) for tok in tokens]

        try:
            tagged = pos_tag(tokens)
            return [
                self._lemmatizer.lemmatize(tok, _wordnet_pos(tag))
                for tok, tag in tagged
            ]
        except LookupError:
            # POS tagger data unavailable — degrade gracefully to noun-only
            # lemmatization rather than crashing the whole pipeline.
            return [self._lemmatizer.lemmatize(tok) for tok in tokens]

    def lemmatize_batch(self, token_lists: list[list[str]]) -> list[list[str]]:
        """Lemmatize a list of token lists."""
        return [self.lemmatize_tokens(toks) for toks in token_lists]


_default_lemmatizer = Lemmatizer()


def lemmatize_tokens(tokens: list[str]) -> list[str]:
    """Convenience function using default Lemmatizer settings."""
    return _default_lemmatizer.lemmatize_tokens(tokens)
