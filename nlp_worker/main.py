import os
import re
import html
import subprocess
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.cluster import MiniBatchKMeans
from sklearn.feature_extraction.text import TfidfVectorizer
import chromadb
from chromadb.config import Settings
import spacy

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=True)
    nlp = spacy.load("en_core_web_sm")

vader_analyzer = SentimentIntensityAnalyzer()

_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
chroma_client = chromadb.PersistentClient(
    path=CHROMA_PERSIST_DIR,
    settings=Settings(allow_reset=True, anonymized_telemetry=False)
)
article_collection = chroma_client.get_or_create_collection(
    name="newspulse_articles",
    metadata={"hnsw:space": "cosine"}
)

app = FastAPI(title="NewsPulse NLP Worker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ArticleProcessRequest(BaseModel):
    id: str
    title: str
    content: str
    source: str
    published_at: Optional[str] = None
    url: Optional[str] = None

class SentimentScore(BaseModel):
    label: str
    score: float
    pos: float
    neu: float
    neg: float

class ProcessedArticleResponse(BaseModel):
    id: str
    sentiment: SentimentScore
    entities: Dict[str, List[str]]
    embedding_dimension: int
    cleaned_length: int

class ClusterRequest(BaseModel):
    n_clusters: Optional[int] = Field(default=5, ge=2, le=20)
    limit: Optional[int] = Field(default=100, ge=5, le=500)

class TopicCluster(BaseModel):
    cluster_id: int
    topic_label: str
    size: int
    top_keywords: List[str]
    sample_titles: List[str]
    sample_article_ids: List[str]

class RAGRequest(BaseModel):
    query: str
    top_k: Optional[int] = Field(default=5, ge=1, le=20)

class SourceCitation(BaseModel):
    citation_id: int
    article_id: str
    title: str
    source: str
    url: Optional[str] = None
    published_at: Optional[str] = None
    similarity_score: float
    excerpt: str

class RAGResponse(BaseModel):
    query: str
    answer: str
    citations: List[SourceCitation]
    confidence_score: float

def clean_text(raw_text: str) -> str:
    if not raw_text:
        return ""
    unescaped = html.unescape(raw_text)
    stripped = re.sub(r"<[^>]+>", " ", unescaped)
    cleaned = re.sub(r"http\S+|www\.\S+", " ", stripped)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def compute_sentiment(text: str) -> SentimentScore:
    scores = vader_analyzer.polarity_scores(text)
    compound = scores["compound"]
    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"
    return SentimentScore(
        label=label,
        score=round(compound, 4),
        pos=round(scores["pos"], 4),
        neu=round(scores["neu"], 4),
        neg=round(scores["neg"], 4)
    )

def extract_named_entities(text: str) -> Dict[str, List[str]]:
    # spaCy max length guard
    truncated_text = text[:100000]
    doc = nlp(truncated_text)
    target_labels = {"PERSON", "ORG", "GPE", "DATE"}
    entities: Dict[str, set] = {label: set() for label in target_labels}

    for ent in doc.ents:
        if ent.label_ in target_labels:
            clean_ent = ent.text.strip()
            if len(clean_ent) > 1 and not clean_ent.isnumeric():
                entities[ent.label_].add(clean_ent)

    return {k: sorted(list(v)) for k, v in entities.items()}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "chroma_docs_count": article_collection.count()
    }

@app.post("/process-article", response_model=ProcessedArticleResponse)
def process_article(payload: ArticleProcessRequest):
    combined_raw = f"{payload.title}. {payload.content}"
    cleaned = clean_text(combined_raw)
    if not cleaned:
        cleaned = clean_text(payload.title)

    sentiment = compute_sentiment(cleaned)
    entities = extract_named_entities(cleaned)

    model = get_embedding_model()
    # Compute dense 384-dimensional representation for HNSW indexing
    embedding = model.encode(cleaned[:2000]).tolist()

    metadata = {
        "article_id": payload.id,
        "title": payload.title[:200],
        "source": payload.source[:100],
        "published_at": payload.published_at or "",
        "url": payload.url or "",
        "sentiment_label": sentiment.label,
        "sentiment_score": float(sentiment.score)
    }

    article_collection.upsert(
        ids=[payload.id],
        embeddings=[embedding],
        metadatas=[metadata],
        documents=[cleaned[:3000]]
    )

    return ProcessedArticleResponse(
        id=payload.id,
        sentiment=sentiment,
        entities=entities,
        embedding_dimension=len(embedding),
        cleaned_length=len(cleaned)
    )

@app.post("/cluster-topics", response_model=List[TopicCluster])
def cluster_topics(payload: ClusterRequest):
    data = article_collection.get(
        include=["embeddings", "metadatas", "documents"],
        limit=payload.limit
    )

    embeddings = data.get("embeddings")
    if embeddings is None or len(embeddings) < 2:
        return []

    matrix = np.array(embeddings)
    n_samples = matrix.shape[0]
    k = min(payload.n_clusters, n_samples)
    if k < 2:
        k = 2

    # Partition embedding space into thematic clusters using cosine-normalized embeddings
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    normalized_matrix = matrix / norms

    kmeans = MiniBatchKMeans(n_clusters=k, random_state=42, batch_size=64, n_init="auto")
    cluster_labels = kmeans.fit_predict(normalized_matrix)

    docs = data.get("documents", [])
    metadatas = data.get("metadatas", [])
    ids = data.get("ids", [])

    results: List[TopicCluster] = []

    for c_id in range(k):
        indices = np.where(cluster_labels == c_id)[0]
        if len(indices) == 0:
            continue

        c_docs = [docs[i] for i in indices]
        c_titles = [metadatas[i].get("title", "Untitled") for i in indices]
        c_ids = [ids[i] for i in indices]

        top_words: List[str] = []
        try:
            tfidf = TfidfVectorizer(max_features=10, stop_words="english", ngram_range=(1, 2))
            tfidf_matrix = tfidf.fit_transform(c_docs)
            scores = np.asarray(tfidf_matrix.sum(axis=0)).ravel()
            words = tfidf.get_feature_names_out()
            ranked_indices = np.argsort(scores)[::-1]
            top_words = [words[idx] for idx in ranked_indices[:5]]
        except Exception:
            top_words = ["news", "update", "report"]

        topic_label = " / ".join([w.title() for w in top_words[:2]]) if top_words else f"Topic {c_id + 1}"

        results.append(TopicCluster(
            cluster_id=int(c_id),
            topic_label=topic_label,
            size=len(indices),
            top_keywords=top_words,
            sample_titles=c_titles[:4],
            sample_article_ids=c_ids[:4]
        ))

    results.sort(key=lambda x: x.size, reverse=True)
    return results

@app.post("/rag-query", response_model=RAGResponse)
def rag_query(payload: RAGRequest):
    if article_collection.count() == 0:
        return RAGResponse(
            query=payload.query,
            answer="No articles have been indexed into the vector database yet. Please ingest RSS feeds first to analyze intelligence.",
            citations=[],
            confidence_score=0.0
        )

    model = get_embedding_model()
    query_vector = model.encode(payload.query).tolist()

    query_results = article_collection.query(
        query_embeddings=[query_vector],
        n_results=min(payload.top_k, article_collection.count()),
        include=["documents", "metadatas", "distances"]
    )

    documents = query_results.get("documents", [[]])[0]
    metadatas = query_results.get("metadatas", [[]])[0]
    distances = query_results.get("distances", [[]])[0]
    ids = query_results.get("ids", [[]])[0]

    citations: List[SourceCitation] = []
    context_chunks = []

    for i, doc in enumerate(documents):
        citation_num = i + 1
        meta = metadatas[i] if i < len(metadatas) else {}
        dist = distances[i] if i < len(distances) else 0.5
        # Convert cosine distance to bounded similarity metric
        sim_score = max(0.0, min(1.0, 1.0 - (dist / 2.0)))
        art_id = ids[i] if i < len(ids) else f"art_{citation_num}"

        excerpt = doc[:280] + "..." if len(doc) > 280 else doc

        citation = SourceCitation(
            citation_id=citation_num,
            article_id=meta.get("article_id", art_id),
            title=meta.get("title", "Untitled Article"),
            source=meta.get("source", "Unknown Source"),
            url=meta.get("url"),
            published_at=meta.get("published_at"),
            similarity_score=round(sim_score, 4),
            excerpt=excerpt
        )
        citations.append(citation)
        context_chunks.append(f"[{citation_num}] ({citation.source}) {citation.title}: {doc}")

    groq_key = os.getenv("GROQ_API_KEY")
    groq_model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    if groq_key:
        try:
            import requests
            headers = {
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            }
            system_prompt = (
                "You are NewsPulse AI, an intelligent news analyst. "
                "Synthesize a factual, insightful answer to the user query based ONLY on the provided news sources. "
                "Always cite sources inline with bracketed numbers like [1], [2] matching the citation list."
            )
            prompt_content = f"Question: {payload.query}\n\nSources:\n" + "\n\n".join(context_chunks)

            llm_res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json={
                    "model": groq_model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt_content}
                    ],
                    "temperature": 0.2
                },
                timeout=15
            )
            if llm_res.status_code == 200:
                answer_text = llm_res.json()["choices"][0]["message"]["content"]
                avg_confidence = float(np.mean([c.similarity_score for c in citations])) if citations else 0.85
                return RAGResponse(
                    query=payload.query,
                    answer=answer_text,
                    citations=citations,
                    confidence_score=round(avg_confidence, 4)
                )
        except Exception:
            pass

    # Extractive summarization fallback with tf-idf overlap scoring
    synthesized_lines = []
    keywords = [w.lower() for w in re.findall(r"\w+", payload.query) if len(w) > 3]

    for cit in citations:
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", cit.excerpt) if len(s.strip()) > 20]
        if not sentences:
            sentences = [cit.excerpt]

        best_sentence = sentences[0]
        max_score = -1
        for s in sentences:
            score = sum(1 for kw in keywords if kw in s.lower())
            if score > max_score:
                max_score = score
                best_sentence = s

        synthesized_lines.append(f"According to {cit.source}, \"{best_sentence}\" [{cit.citation_id}]")

    summary_lead = f"Based on analysis of {len(citations)} recent reports covering \"{payload.query}\":"
    combined_body = " ".join(synthesized_lines)
    full_answer = f"{summary_lead}\n\n{combined_body}"

    avg_sim = float(np.mean([c.similarity_score for c in citations])) if citations else 0.0

    return RAGResponse(
        query=payload.query,
        answer=full_answer,
        citations=citations,
        confidence_score=round(avg_sim, 4)
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

