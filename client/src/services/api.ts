import axios from "axios";
import {
  ArticlesResponse,
  TrendData,
  ComparisonData,
  FeedSource,
  Citation
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json"
  }
});

export interface FetchArticlesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sentiment?: string;
  entity?: string;
  source?: string;
}

export async function fetchArticles(params: FetchArticlesParams = {}): Promise<ArticlesResponse> {
  const response = await api.get<ArticlesResponse>("/articles", { params });
  return response.data;
}

export async function fetchTrends(): Promise<TrendData> {
  const response = await api.get<TrendData>("/trends");
  return response.data;
}

export async function fetchComparison(topic: string): Promise<ComparisonData> {
  const response = await api.get<ComparisonData>(`/compare/${encodeURIComponent(topic)}`);
  return response.data;
}

export interface ChatResponse {
  query: string;
  answer: string;
  citations: Citation[];
  confidence_score: number;
}

export async function queryAIChat(query: string, topK: number = 5): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>("/chat", { query, top_k: topK });
  return response.data;
}

export async function triggerIngest(): Promise<{ success: boolean; message: string; result?: any }> {
  const response = await api.post("/ingest");
  return response.data;
}

export async function fetchFeeds(): Promise<{ feeds: FeedSource[] }> {
  const response = await api.get<{ feeds: FeedSource[] }>("/feeds");
  return response.data;
}

export async function addFeed(data: { name: string; url: string; category: string }): Promise<{ success: boolean; feed: FeedSource }> {
  const response = await api.post<{ success: boolean; feed: FeedSource }>("/feeds", data);
  return response.data;
}

export async function toggleFeed(id: string): Promise<{ success: boolean; feed: FeedSource }> {
  const response = await api.patch<{ success: boolean; feed: FeedSource }>(`/feeds/${id}`);
  return response.data;
}

export async function deleteFeed(id: string): Promise<{ success: boolean }> {
  const response = await api.delete<{ success: boolean }>(`/feeds/${id}`);
  return response.data;
}

