# Project Abstract

## Fake News Detection System Using Machine Learning and Natural Language Processing

The proliferation of misinformation across digital media has made automated tools for verifying news content increasingly important. This project presents a full-stack web application that classifies news articles as **REAL** or **FAKE** using classical Natural Language Processing (NLP) techniques combined with supervised Machine Learning (ML).

The system's pipeline begins with text preprocessing — cleaning (removal of HTML, URLs, punctuation, and noise), tokenization, stopword removal, and lemmatization — followed by feature extraction using **TF-IDF (Term Frequency–Inverse Document Frequency)** vectorization with unigram and bigram features. Three classical classification algorithms are trained on this feature representation: **Logistic Regression**, **Multinomial Naive Bayes**, and **Random Forest**. Each model is evaluated on a held-out test set using accuracy, precision, recall, and F1 score, and the best-performing model (by F1 score) is automatically selected and persisted for inference.

The application is delivered as a three-layer system: a **FastAPI** backend exposing a REST API for authentication (JWT-based), prediction, history retrieval, analytics, and administrative functions; a **React (Vite + Tailwind CSS)** frontend providing an interactive, responsive, dark-mode-capable user interface; and an **ML pipeline** producing the trained model artifacts consumed by the backend. Data is persisted using **SQLite** via SQLAlchemy ORM. The entire system is containerized using **Docker and Docker Compose** for reproducible deployment.

Key features include: user registration and authentication; real-time article classification with a confidence score; a searchable, filterable, paginated prediction history; an analytics dashboard with interactive charts (Chart.js) summarizing classification trends and model performance; PDF/CSV report export; and an administrative panel for user management and platform-wide analytics.

This project demonstrates the end-to-end engineering required to take a machine learning model from offline training to a production-style, multi-user web application — encompassing NLP preprocessing design, model comparison methodology, REST API architecture, frontend state management, authentication/authorization, and containerized deployment.

**Keywords:** Fake News Detection, Natural Language Processing, TF-IDF, Logistic Regression, Naive Bayes, Random Forest, FastAPI, React, Machine Learning, Text Classification.
