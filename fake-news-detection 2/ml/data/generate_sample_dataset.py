"""
generate_sample_dataset.py
===========================
Generates a synthetic but stylistically realistic REAL/FAKE news dataset
for local development, testing, and demoing the training pipeline when
a licensed corpus (e.g. Kaggle's "Fake and Real News Dataset") is not
available.

IMPORTANT: This synthetic dataset is for pipeline development and
demonstration only. For a production-grade model, replace
ml/data/news_dataset.csv with a real, properly licensed dataset (the
Kaggle ISOT Fake News Dataset or similar) — see README.md "Retraining
the Model" section for the expected CSV schema (text, label columns).
"""

import csv
import random
from pathlib import Path

random.seed(42)

# ---- Building blocks for REAL-style articles: measured, attributed,
# specific, institutional language typical of wire-service journalism ----
REAL_SUBJECTS = [
    "the Federal Reserve", "the World Health Organization", "the city council",
    "the Department of Transportation", "researchers at Stanford University",
    "the European Central Bank", "the Ministry of Finance", "the Supreme Court",
    "NASA", "the United Nations Security Council", "the central bank",
    "the Bureau of Labor Statistics", "local election officials",
    "the state legislature", "the World Trade Organization",
]
REAL_ACTIONS = [
    "announced new policy measures on {topic} following a quarterly review",
    "released a report on {topic} based on data collected over the past year",
    "held a press conference to clarify regulations concerning {topic}",
    "approved a budget allocation for {topic} after a unanimous vote",
    "published findings on {topic} in a peer-reviewed study",
    "confirmed that {topic} figures rose slightly compared to the previous quarter",
    "issued a statement addressing public concerns about {topic}",
    "voted to amend existing guidelines related to {topic}",
]
REAL_TOPICS = [
    "interest rates", "public health funding", "infrastructure spending",
    "renewable energy subsidies", "education budgets", "trade tariffs",
    "unemployment benefits", "climate policy", "vaccine distribution",
    "housing affordability", "minimum wage laws", "data privacy regulations",
]
REAL_CLOSERS = [
    "Officials said further details would be released in the coming weeks.",
    "The decision is expected to take effect next quarter, according to spokespeople.",
    "Independent analysts said the move was consistent with prior policy trends.",
    "A full report will be made available on the agency's official website.",
    "Critics and supporters alike were invited to submit public comments.",
    "The announcement followed weeks of internal review and stakeholder consultation.",
]

# ---- Building blocks for FAKE-style articles: sensational, unverified,
# conspiratorial, emotionally charged language typical of disinformation ----
FAKE_SUBJECTS = [
    "anonymous insiders", "a secret government memo", "leaked documents",
    "an unnamed whistleblower", "shocking new evidence", "a viral video",
    "sources close to the matter", "a banned report", "exclusive footage",
    "a doctor who wishes to remain anonymous", "a former employee",
]
FAKE_ACTIONS = [
    "reveal that {topic} is being secretly controlled by global elites",
    "prove that officials have been hiding the truth about {topic} for years",
    "expose a massive cover-up involving {topic} that the mainstream media refuses to report",
    "claim that {topic} was engineered as part of a hidden agenda",
    "show undeniable proof that {topic} is a complete hoax",
    "confirm shocking rumors about {topic} that will change everything you thought you knew",
    "warn that {topic} is part of a dangerous conspiracy nobody is talking about",
]
FAKE_TOPICS = [
    "the vaccine rollout", "the election results", "the moon landing",
    "5G networks", "the financial system", "the weather control program",
    "the new world order", "celebrity deaths", "the water supply",
    "the upcoming pandemic", "secret chemical trails", "the banking elite",
]
FAKE_CLOSERS = [
    "Share this before it gets DELETED by the censors!!!",
    "Wake up, people — this is bigger than anyone could imagine.",
    "The mainstream media will NEVER tell you this.",
    "Do your own research and you'll see the TRUTH for yourself.",
    "This article is being suppressed across every major platform.",
    "They don't want you to know this, but now you do.",
]


def _build_article(subject: str, action_template: str, topic: str, closer: str) -> str:
    action = action_template.format(topic=topic)
    return f"{subject.capitalize()} {action}. {closer}"


def generate_real_article() -> str:
    subject = random.choice(REAL_SUBJECTS)
    action = random.choice(REAL_ACTIONS)
    topic = random.choice(REAL_TOPICS)
    closer = random.choice(REAL_CLOSERS)
    return _build_article(subject, action, topic, closer)


def generate_fake_article() -> str:
    subject = random.choice(FAKE_SUBJECTS)
    action = random.choice(FAKE_ACTIONS)
    topic = random.choice(FAKE_TOPICS)
    closer = random.choice(FAKE_CLOSERS)
    return _build_article(subject, action, topic, closer)


def generate_dataset(n_per_class: int = 750) -> list[dict]:
    """
    Generate a balanced synthetic dataset.

    Args:
        n_per_class: number of articles to generate per label.

    Returns:
        List of {"text": str, "label": "REAL"|"FAKE"} dicts, shuffled.
    """
    rows = []
    seen = set()

    while len([r for r in rows if r["label"] == "REAL"]) < n_per_class:
        article = generate_real_article()
        if article not in seen:
            seen.add(article)
            rows.append({"text": article, "label": "REAL"})

    while len([r for r in rows if r["label"] == "FAKE"]) < n_per_class:
        article = generate_fake_article()
        if article not in seen:
            seen.add(article)
            rows.append({"text": article, "label": "FAKE"})

    random.shuffle(rows)
    return rows


def main():
    output_path = Path(__file__).resolve().parent.parent / "data" / "news_dataset.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    rows = generate_dataset(n_per_class=750)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["text", "label"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} rows -> {output_path}")
    print(f"  REAL: {sum(1 for r in rows if r['label'] == 'REAL')}")
    print(f"  FAKE: {sum(1 for r in rows if r['label'] == 'FAKE')}")


if __name__ == "__main__":
    main()
