export interface ArticleEntities {
  PERSON?: string[];
  ORG?: string[];
  GPE?: string[];
  DATE?: string[];
}

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

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EntityFrequency {
  name: string;
  count: number;
}

export interface TopicCluster {
  cluster_id: number;
  topic_label: string;
  size: number;
  top_keywords: string[];
  sample_titles: string[];
  sample_article_ids: string[];
}

export interface TimelinePoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface TrendData {
  totalArticles: number;
  entityTrends: {
    people: EntityFrequency[];
    organizations: EntityFrequency[];
    locations: EntityFrequency[];
  };
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  timeline: TimelinePoint[];
  topicClusters: TopicCluster[];
}

export interface PublisherNarrative {
  source: string;
  articleCount: number;
  avgSentiment: number;
  dominantSentiment: "positive" | "neutral" | "negative";
  keyEntities: string[];
  sampleHeadlines: string[];
  narrativeFraming: string;
  latestDate: string;
}

export interface ComparisonData {
  topic: string;
  totalArticles: number;
  publishers: PublisherNarrative[];
  sentimentComparison: {
    source: string;
    sentimentScore: number;
    articleCount: number;
    sentiment: string;
  }[];
  consensusEntities: { name: string; count: number }[];
  summaryAnalysis: string;
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

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: PaginationMeta;
}

