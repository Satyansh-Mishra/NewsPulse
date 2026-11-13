# NewsPulse: AI-Powered News Intelligence & Trend Explorer

Production-grade, full-stack AI platform designed to aggregate, analyze, vectorize, and compare cross-publisher news reporting in real time. NewsPulse extracts Named Entities (NER), computes VADER sentiment polarity, indexes dense vector embeddings into ChromaDB, detects semantic topic clusters, and exposes a verified RAG AI Assistant with inline citations.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │    RSS Feeds (Tech, World, Business)    │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
┌───────────────────┐             ┌───────────────┐            ┌────────────────────────┐
│  React Dashboard  │ <─────────> │ Express API   │ <────────> │   FastAPI NLP Worker   │
│  (Vite + Tailwind)│   REST      │ (Node.js + TS)│    HTTP    │ (spaCy, VADER, MiniLM) │
└───────────────────┘             └───────┬───────┘            └───────────┬────────────┘
          ▲                               │                                │
          │                               ▼                                ▼
   Interactive UI              ┌─────────────────────┐          ┌───────────────────────┐
 (Charts, RAG Drawer,          │ PostgreSQL Database │          │ Persistent ChromaDB   │
  Feed Manager, Matrix)        │ (Prisma ORM Models) │          │ (Cosine HNSW Index)   │
                               └─────────────────────┘          └───────────────────────┘
```

---

## Directory Structure

```
newspulse/
├── client/                      # React + TypeScript + Vite + Tailwind CSS Frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── EntityTag.tsx
│   │   │   ├── FeedModal.tsx
│   │   │   └── AIChatDrawer.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TrendsView.tsx
│   │   │   └── ComparisonView.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                      # Node.js + Express + TypeScript + Prisma Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.ts
│   │   ├── controllers/
│   │   │   ├── articleController.ts
│   │   │   └── chatController.ts
│   │   ├── routes/
│   │   │   ├── articleRoutes.ts
│   │   │   └── chatRoutes.ts
│   │   ├── services/
│   │   │   └── ingestionService.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── nlp_worker/                  # Python FastAPI NLP & Vector Embedding Microservice
│   ├── main.py
│   └── requirements.txt
│
├── docker-compose.yml           # PostgreSQL & ChromaDB orchestration
├── .env.example
└── README.md
```

---

## Prerequisites

- **Docker & Docker Desktop** (for PostgreSQL and ChromaDB)
- **Node.js**: v18+ or v20+
- **Python**: 3.10+ or 3.11+
- **npm** or **pnpm**

---

## Quickstart Guide

### 1. Start Infrastructure (PostgreSQL & ChromaDB)

Start the persistent PostgreSQL database and ChromaDB vector engine:

```bash
docker compose up -d postgres chromadb
```

To verify containers are running:

```bash
docker compose ps
```

---

### 2. Configure Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env
cp .env.example server/.env
```

---

### 3. Service 1: Python NLP Microservice

In a separate terminal, set up and launch the FastAPI NLP worker:

```bash
cd nlp_worker

# Create and activate Python virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate

# On Linux/macOS:
source venv/bin/activate

# Install NLP & vector dependencies
pip install -r requirements.txt

# Download spaCy English language model
python -m spacy download en_core_web_sm

# Start FastAPI server on port 8000
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Health check: `http://localhost:8000/health`

---

### 4. Service 2: Node.js + TypeScript Backend

In a separate terminal, initialize the Prisma client and launch the Express API:

```bash
cd server

# Install Node dependencies
npm install

# Push database schema to PostgreSQL
npx prisma db push

# (Optional) Open Prisma Studio to inspect records
npx prisma studio

# Start development server with live reload on port 5000
npm run dev
```

Health check: `http://localhost:5000/health`

---

### 5. Service 3: React + TypeScript Frontend

In a separate terminal, launch the Vite development server:

```bash
cd client

# Install frontend dependencies
npm install

# Start Vite client on port 3000
npm run dev
```

Open your browser at: **`http://localhost:3000`**

---

## Concurrent Launch Option

To launch all three development servers concurrently from the workspace root using `npm`:

```bash
# In server directory:
npm run dev

# In client directory:
npm run dev

# In nlp_worker directory:
uvicorn main:app --port 8000 --reload
```

Or deploy all services in isolated containers:

```bash
docker compose up --build
```

---

## Core Capabilities & Endpoints

### 1. NLP Worker Endpoints (`:8000`)
- `POST /process-article`: Cleans text, calculates VADER sentiment scores (`pos`, `neu`, `neg`, `compound`), performs spaCy NER (`PERSON`, `ORG`, `GPE`, `DATE`), generates `all-MiniLM-L6-v2` dense embeddings, and stores document in ChromaDB.
- `POST /cluster-topics`: Normalizes vector embeddings and partitions recent stories into semantic clusters with TF-IDF keyword labeling.
- `POST /rag-query`: Queries ChromaDB vector collection using cosine similarity, synthesizes cross-article summaries using Groq API (`openai/gpt-oss-120b` or configurable `GROQ_MODEL`) with extractive fallback, and embeds clickable bracketed citations (`[1]`, `[2]`).

### 2. Backend API Endpoints (`:5000/api`)
- `GET /api/articles`: Pagination, free-text search, and multi-dimensional filtering by category, sentiment, and extracted entity.
- `GET /api/trends`: Entity frequency aggregations, sentiment balance distributions, timeline trends, and topic cluster insights.
- `GET /api/compare/:topic`: Multi-source narrative comparison analyzing how different news outlets report on identical topics.
- `POST /api/chat`: Proxies user questions to the RAG vector engine with fallback summarization.
- `POST /api/ingest`: Triggers immediate feed ingestion across all active RSS sources.
- `GET /api/feeds` & `POST /api/feeds`: Manage and add custom RSS streams.

---

## Verification & TypeScript Check

Ensure strict TypeScript types across both server and client:

```bash
# Check client types
cd client && npx tsc --noEmit

# Check server types
cd ../server && npx tsc --noEmit
```

