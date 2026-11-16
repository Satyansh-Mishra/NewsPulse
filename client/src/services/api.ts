import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string | null;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  entities: ArticleEntities;
  topicLabel?: string;
  category?: string;
  createdAt?: string;
}

export interface ArticleEntities {
  PERSON?: string[];
  ORG?: string[];
  GPE?: string[];
  DATE?: string[];
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatResponse {
  query: string;
  answer: string;
  citations: Citation[];
  confidence_score: number;
}

export interface Citation {
  citation_id: number;
  article_id: string;
  title: string;
  source: string;
  url?: string;
  published_at?: string;
  similarity_score: number;
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
  confidence?: number;
}

export interface FetchArticlesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sentiment?: string;
  entity?: string;
  source?: string;
}

export async function fetchArticles(params: FetchArticlesParams = {}): Promise<any> {
  const response = await api.get<any>("/articles", { params });
  return response.data;
}

export async function fetchTrends(): Promise<any> {
  const response = await api.get<any>("/trends");
  return response.data;
}

export async function fetchComparison(topic: string): Promise<any> {
  const response = await api.get<any>(`/compare/${encodeURIComponent(topic)}`);
  return response.data;
}

export interface ChatResponseData {
  query: string;
  answer: string;
  citations: Citation[];
  confidence_score: number;
}

export async function queryAIChat(query: string, history: ChatMessage[] = [], topK: number = 5): Promise<ChatResponseData> {
  const response = await api.post<ChatResponseData>("/chat", { query, history, top_k: topK });
  return response.data;
}

export async function triggerIngest(): Promise<any> {
  const response = await api.post<any>("/ingest");
  return response.data;
}

export async function fetchFeeds(): Promise<any> {
  const response = await api.get<any>("/feeds");
  return response.data;
}

export async function addFeed(data: { name: string; url: string; category: string }): Promise<any> {
  const response = await api.post<any>("/feeds", data);
  return response.data;
}

export async function toggleFeed(id: string): Promise<any> {
  const response = await api.patch<any>(`/feeds/${id}`);
  return response.data;
}

export async function deleteFeed(id: string): Promise<any> {
  const response = await api.delete<any>(`/feeds/${id}`);
  return response.data;
}
