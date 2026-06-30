"""
test_ml.py
==========
Unit and integration tests for the ML pipeline: text preprocessing
(cleaning, tokenizing, lemmatizing), feature extraction (TF-IDF), and
the model training/comparison/save logic.

Run with:
    pytest tests/test_ml.py -v
"""

import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.preprocessing.text_cleaner import TextCleaner, clean_text
from ml.preprocessing.tokenizer import Tokenizer, tokenize_text
from ml.preprocessing.lemmatizer import Lemmatizer, lemmatize_tokens
from ml.preprocessing.feature_extractor import TextPreprocessor, FeatureExtractor, build_tfidf_vectorizer


# ---------------------------------------------------------------------------
# TextCleaner
# ---------------------------------------------------------------------------

class TestTextCleaner:
    def setup_method(self):
        self.cleaner = TextCleaner()

    def test_lowercases_text(self):
        assert self.cleaner.clean("HELLO World") == "hello world"

    def test_removes_urls(self):
        result = self.cleaner.clean("Check this out http://example.com/page for details")
        assert "http" not in result
        assert "example" not in result

    def test_removes_html_tags(self):
        result = self.cleaner.clean("<p>Breaking <b>news</b> today</p>")
        assert "<" not in result
        assert "breaking" in result
        assert "news" in result

    def test_removes_punctuation(self):
        result = self.cleaner.clean("Wow!!! Is this real??? Yes, definitely.")
        assert "!" not in result
        assert "?" not in result
        assert "," not in result

    def test_removes_mentions_and_hashtags(self):
        result = self.cleaner.clean("Great report @newsbot check #fakenews trends")
        assert "@" not in result
        assert "#" not in result

    def test_collapses_whitespace(self):
        result = self.cleaner.clean("too    many     spaces")
        assert "  " not in result

    def test_handles_none_input(self):
        assert self.cleaner.clean(None) == ""

    def test_handles_empty_string(self):
        assert self.cleaner.clean("") == ""

    def test_handles_too_short_input(self):
        assert self.cleaner.clean("ab") == ""

    def test_clean_batch_returns_same_length(self):
        texts = ["Hello World", "Test 123", ""]
        results = self.cleaner.clean_batch(texts)
        assert len(results) == len(texts)

    def test_module_level_convenience_function(self):
        assert clean_text("HELLO") == "hello"


# ---------------------------------------------------------------------------
# Tokenizer
# ---------------------------------------------------------------------------

class TestTokenizer:
    def setup_method(self):
        self.tokenizer = Tokenizer()

    def test_tokenizes_simple_sentence(self):
        tokens = self.tokenizer.tokenize("government announces new policy today")
        assert isinstance(tokens, list)
        assert all(isinstance(t, str) for t in tokens)

    def test_removes_stopwords(self):
        tokens = self.tokenizer.tokenize("the government and the people")
        assert "the" not in tokens
        assert "and" not in tokens

    def test_removes_short_tokens(self):
        tokenizer = Tokenizer(min_token_length=3)
        tokens = tokenizer.tokenize("a an it is government")
        assert all(len(t) >= 3 for t in tokens)

    def test_handles_empty_string(self):
        assert self.tokenizer.tokenize("") == []

    def test_tokenize_batch_returns_list_of_lists(self):
        results = self.tokenizer.tokenize_batch(["hello world", "another sentence"])
        assert len(results) == 2
        assert all(isinstance(r, list) for r in results)

    def test_module_level_convenience_function(self):
        tokens = tokenize_text("government policy announcement")
        assert isinstance(tokens, list)


# ---------------------------------------------------------------------------
# Lemmatizer
# ---------------------------------------------------------------------------

class TestLemmatizer:
    def setup_method(self):
        self.lemmatizer = Lemmatizer()

    def test_lemmatizes_token_list(self):
        result = self.lemmatizer.lemmatize_tokens(["running", "studies", "better"])
        assert isinstance(result, list)
        assert len(result) == 3

    def test_handles_empty_list(self):
        assert self.lemmatizer.lemmatize_tokens([]) == []

    def test_preserves_token_count(self):
        tokens = ["government", "officials", "announced", "policies"]
        result = self.lemmatizer.lemmatize_tokens(tokens)
        assert len(result) == len(tokens)

    def test_module_level_convenience_function(self):
        result = lemmatize_tokens(["running", "jumped"])
        assert isinstance(result, list)
        assert len(result) == 2


# ---------------------------------------------------------------------------
# Feature extraction / TF-IDF
# ---------------------------------------------------------------------------

class TestTextPreprocessor:
    def setup_method(self):
        self.preprocessor = TextPreprocessor()

    def test_full_pipeline_returns_string(self):
        result = self.preprocessor.preprocess("The government announced NEW policies today!!!")
        assert isinstance(result, str)
        assert result == result.lower()

    def test_empty_input_returns_empty_string(self):
        assert self.preprocessor.preprocess("") == ""

    def test_preprocess_batch_matches_length(self):
        texts = ["First article here", "Second article here", "Third one too"]
        results = self.preprocessor.preprocess_batch(texts)
        assert len(results) == len(texts)


class TestFeatureExtractor:
    def setup_method(self):
        self.sample_texts = [
            "The government announced new economic policies today according to officials.",
            "Scientists discovered a miracle cure that doctors are hiding from the public.",
            "The local council held a meeting regarding budget allocations for schools.",
            "Aliens secretly control world governments according to anonymous sources.",
            "Officials confirmed the policy change will take effect next month.",
            "Anonymous insiders reveal shocking secret government conspiracy today.",
        ]

    def test_fit_transform_produces_matrix(self):
        extractor = FeatureExtractor()
        matrix = extractor.fit_transform(self.sample_texts)
        assert matrix.shape[0] == len(self.sample_texts)
        assert matrix.shape[1] > 0

    def test_transform_before_fit_raises(self):
        extractor = FeatureExtractor()
        with pytest.raises(RuntimeError):
            extractor.transform(["some text"])

    def test_transform_after_fit_works(self):
        extractor = FeatureExtractor()
        extractor.fit_transform(self.sample_texts)
        result = extractor.transform(["A new article about government policy."])
        assert result.shape[0] == 1

    def test_save_and_load_roundtrip(self, tmp_path):
        extractor = FeatureExtractor()
        extractor.fit_transform(self.sample_texts)

        save_path = tmp_path / "vectorizer.joblib"
        extractor.save(str(save_path))
        assert save_path.exists()

        loaded = FeatureExtractor.load(str(save_path))
        original_result = extractor.transform(["test government article"])
        loaded_result = loaded.transform(["test government article"])
        assert (original_result.toarray() == loaded_result.toarray()).all()

    def test_get_feature_names_before_fit_raises(self):
        extractor = FeatureExtractor()
        with pytest.raises(RuntimeError):
            extractor.get_feature_names()

    def test_build_tfidf_vectorizer_respects_max_features(self):
        vectorizer = build_tfidf_vectorizer(max_features=50)
        assert vectorizer.max_features == 50


# ---------------------------------------------------------------------------
# Model comparison / training (integration-style, uses real sklearn)
# ---------------------------------------------------------------------------

class TestModelComparison:
    def setup_method(self):
        from ml.training.model_comparison import get_candidate_models, train_and_compare, select_best_model

        self.get_candidate_models = get_candidate_models
        self.train_and_compare = train_and_compare
        self.select_best_model = select_best_model

        # Small synthetic dataset distinct enough to train quickly and
        # deterministically for unit testing purposes.
        self.real_texts = [
            "officials announced policy changes today",
            "council approved budget allocation plan",
            "researchers published findings in journal",
            "department released quarterly report data",
        ] * 5
        self.fake_texts = [
            "shocking secret conspiracy revealed exclusive",
            "anonymous insider exposes hidden truth cover up",
            "government secretly controls everything wake up",
            "miracle cure doctors hiding from public",
        ] * 5

    def test_get_candidate_models_returns_three_models(self):
        models = self.get_candidate_models()
        assert len(models) == 3
        assert "Logistic Regression" in models
        assert "Multinomial Naive Bayes" in models
        assert "Random Forest" in models

    def test_train_and_compare_returns_results_for_all_models(self):
        extractor = FeatureExtractor()
        all_texts = self.real_texts + self.fake_texts
        labels = ["REAL"] * len(self.real_texts) + ["FAKE"] * len(self.fake_texts)

        X = extractor.fit_transform(all_texts)
        results = self.train_and_compare(X, labels, X, labels)  # same data for train/test in this quick unit test

        assert len(results) == 3
        for r in results:
            assert 0.0 <= r.accuracy <= 1.0
            assert 0.0 <= r.f1 <= 1.0

    def test_select_best_model_picks_highest_f1(self):
        extractor = FeatureExtractor()
        all_texts = self.real_texts + self.fake_texts
        labels = ["REAL"] * len(self.real_texts) + ["FAKE"] * len(self.fake_texts)

        X = extractor.fit_transform(all_texts)
        results = self.train_and_compare(X, labels, X, labels)
        best = self.select_best_model(results)

        assert best.f1 == max(r.f1 for r in results)


# ---------------------------------------------------------------------------
# save_model.py
# ---------------------------------------------------------------------------

class TestSaveModel:
    def test_should_replace_when_no_existing_metadata(self, tmp_path):
        from ml.training.save_model import should_replace_existing_model

        fake_metadata_path = tmp_path / "nonexistent_metadata.json"
        assert should_replace_existing_model(str(fake_metadata_path), new_f1=0.5) is True

    def test_save_artifacts_creates_expected_files(self, tmp_path):
        from ml.training.save_model import save_artifacts
        from ml.training.model_comparison import ModelResult
        from sklearn.linear_model import LogisticRegression

        extractor = FeatureExtractor()
        texts = ["real news article here", "fake conspiracy article here"] * 3
        labels = ["REAL", "FAKE"] * 3
        X = extractor.fit_transform(texts)

        model = LogisticRegression()
        model.fit(X, labels)

        result = ModelResult(
            name="Logistic Regression",
            model=model,
            accuracy=0.9,
            precision=0.9,
            recall=0.9,
            f1=0.9,
            confusion_matrix=[[3, 0], [0, 3]],
            classification_report="dummy report",
            train_time_seconds=0.1,
        )

        metadata = save_artifacts(
            best_result=result,
            vectorizer=extractor.vectorizer,
            all_results=[result],
            model_dir=str(tmp_path),
            dataset_path="dummy.csv",
            n_train=6,
            n_test=2,
        )

        assert (tmp_path / "best_model.joblib").exists()
        assert (tmp_path / "tfidf_vectorizer.joblib").exists()
        assert (tmp_path / "model_metadata.json").exists()
        assert metadata["best_model_name"] == "Logistic Regression"


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
