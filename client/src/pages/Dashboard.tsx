import React, { useState, useEffect } from "react";
import {
  Layers,
  TrendingUp,
  Award,
  Radio,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Inbox
} from "lucide-react";
import { Article, TrendData } from "../types";
import { fetchArticles, fetchTrends } from "../services/api";
import { ArticleCard } from "../components/ArticleCard";
import { SearchBar } from "../components/SearchBar";
import { EntityType } from "../components/EntityTag";

interface DashboardProps {
  onSelectEntity: (name: string, type: EntityType) => void;
  onAskAI: (prompt: string) => void;
  onCompareTopic: (topic: string) => void;
}

const CATEGORIES = ["All", "Tech", "World", "Business", "Science", "Politics"];

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectEntity,
  onAskAI,
  onCompareTopic
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeEntity, setActiveEntity] = useState<string | null>(null);
  const [activeSentiment, setActiveSentiment] = useState("all");
  const [selectedSource, setSelectedSource] = useState("All");
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  useEffect(() => {
    loadTrends();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [page, selectedCategory, searchTerm, activeEntity, activeSentiment, selectedSource]);

  const loadTrends = async () => {
    try {
      const data = await fetchTrends();
      setTrends(data);
    } catch {}
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await fetchArticles({
        page,
        limit: 12,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        search: searchTerm || undefined,
        entity: activeEntity || undefined,
        sentiment: activeSentiment !== "all" ? activeSentiment : undefined,
        source: selectedSource !== "All" ? selectedSource : undefined
      });

      setArticles(data.articles || []);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalCount(data.pagination.totalCount || 0);

      const uniqueSources = Array.from(
        new Set((data.articles || []).map((a) => a.source))
      ).filter(Boolean);
      setAvailableSources((prev) => Array.from(new Set([...prev, ...uniqueSources])));
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEntityClick = (name: string, type: EntityType) => {
    setActiveEntity(name);
    setPage(1);
    onSelectEntity(name, type);
  };

  const topEntity = trends?.entityTrends.organizations[0] ||
    trends?.entityTrends.people[0] ||
    trends?.entityTrends.locations[0];

  const totalSentimentCount = trends
    ? trends.sentimentDistribution.positive +
      trends.sentimentDistribution.neutral +
      trends.sentimentDistribution.negative
    : 0;

  const posPct = totalSentimentCount > 0
    ? Math.round((trends!.sentimentDistribution.positive / totalSentimentCount) * 100)
    : 0;
  const neuPct = totalSentimentCount > 0
    ? Math.round((trends!.sentimentDistribution.neutral / totalSentimentCount) * 100)
    : 0;
  const negPct = totalSentimentCount > 0
    ? Math.round((trends!.sentimentDistribution.negative / totalSentimentCount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Total Analyzed</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {totalCount || trends?.totalArticles || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cross-publisher ingested stories</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Sentiment Balance</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold mb-1.5">
            <span className="text-emerald-400">{posPct}% Pos</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">{neuPct}% Neu</span>
            <span className="text-slate-400">•</span>
            <span className="text-rose-400">{negPct}% Neg</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
            <div style={{ width: `${posPct}%` }} className="bg-emerald-500 h-full" />
            <div style={{ width: `${neuPct}%` }} className="bg-slate-600 h-full" />
            <div style={{ width: `${negPct}%` }} className="bg-rose-500 h-full" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Lead Trending Entity</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white truncate">
            {topEntity ? topEntity.name : "Analyzing..."}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {topEntity ? `${topEntity.count} mentions across reports` : "Ingesting stream"}
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Intelligence Stream</span>
            <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-base font-bold text-white">Live Monitoring</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">HNSW Vector Space Synced</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {articles.length} of {totalCount} reports
        </div>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setPage(1);
        }}
        activeEntity={activeEntity}
        onClearEntity={() => {
          setActiveEntity(null);
          setPage(1);
        }}
        activeSentiment={activeSentiment}
        onSentimentChange={(s) => {
          setActiveSentiment(s);
          setPage(1);
        }}
        selectedSource={selectedSource}
        onSourceChange={(src) => {
          setSelectedSource(src);
          setPage(1);
        }}
        availableSources={availableSources}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-800 rounded w-20" />
                <div className="h-4 bg-slate-800 rounded w-16" />
              </div>
              <div className="h-6 bg-slate-800 rounded w-full" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-800 rounded w-5/6" />
              </div>
              <div className="h-4 bg-slate-800 rounded w-32" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/20 border border-slate-800/80 rounded-2xl p-8 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No articles match your criteria</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search terms, clearing active entity filters, or clicking "Sync Feeds" in the navbar to ingest fresh stories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onSelectEntity={handleEntityClick}
              onAskAI={onAskAI}
              onCompareTopic={onCompareTopic}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-400 font-mono">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

