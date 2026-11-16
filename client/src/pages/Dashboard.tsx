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

      const uniqueSources: string[] = Array.from(
        new Set((data.articles || []).map((a: Article) => a.source))
      ).filter((s): s is string => Boolean(s));
      setAvailableSources((prev: string[]) => Array.from(new Set([...prev, ...uniqueSources])));
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
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[26px] bg-slate-950 px-6 py-7 text-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:px-9 sm:py-9">
        <div className="pointer-events-none absolute -right-10 -top-32 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-40 -bottom-48 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(94,234,212,0.9)]" />
              The NewsPulse briefing
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-[40px]">
              The world, <span className="text-slate-400">in context.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Follow the stories shaping today, compare how publishers cover them, and find the signals behind the headlines.
            </p>
          </div>
          <button
            onClick={() => onAskAI("Give me a concise briefing on the most important news right now.")}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-teal-100 sm:self-auto"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Get an AI briefing
          </button>
        </div>
      </section>

      <section aria-label="News intelligence overview" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Stories analyzed</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Layers className="h-4 w-4" /></span>
          </div>
          <div className="mt-3 text-[30px] font-bold tracking-[-0.06em] text-slate-950">{totalCount || trends?.totalArticles || 0}</div>
          <p className="mt-1 text-xs text-slate-500">Across publishers and topics</p>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Sentiment mix</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><TrendingUp className="h-4 w-4" /></span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-bold">
            <span className="text-emerald-700">{posPct}% Positive</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600">{neuPct}% Neutral</span>
            <span className="text-slate-300">/</span>
            <span className="text-rose-700">{negPct}% Negative</span>
          </div>
          <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div style={{ width: `${posPct}%` }} className="h-full bg-emerald-500" />
            <div style={{ width: `${neuPct}%` }} className="h-full bg-slate-300" />
            <div style={{ width: `${negPct}%` }} className="h-full bg-rose-500" />
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Most mentioned</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Award className="h-4 w-4" /></span>
          </div>
          <div className="mt-3 truncate text-xl font-bold tracking-[-0.04em] text-slate-950">{topEntity?.name || "Building your briefing"}</div>
          <p className="mt-1 text-xs text-slate-500">{topEntity ? `${topEntity.count} mentions in recent coverage` : "Insights appear as stories are analyzed"}</p>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Monitoring</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Radio className="h-4 w-4" /></span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-base font-bold tracking-[-0.03em] text-slate-950">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live intelligence
          </div>
          <p className="mt-1 text-xs text-slate-500">Publisher feeds are being tracked</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-950 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="text-xs font-medium text-slate-500">
            Showing <span className="font-bold text-slate-800">{articles.length}</span> of <span className="font-bold text-slate-800">{totalCount}</span> stories
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-5 flex justify-between"><div className="h-5 w-20 rounded-full bg-slate-100" /><div className="h-5 w-16 rounded-full bg-slate-100" /></div>
              <div className="h-5 w-full rounded bg-slate-100" />
              <div className="mt-4 space-y-2"><div className="h-3 w-full rounded bg-slate-100" /><div className="h-3 w-5/6 rounded bg-slate-100" /></div>
              <div className="mt-7 h-4 w-32 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Inbox className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No stories match those filters</h3>
          <p className="mx-auto max-w-md text-xs leading-5 text-slate-500">
            Try adjusting your search terms, clearing active entity filters, or clicking "Sync Feeds" in the navbar to ingest fresh stories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-medium text-slate-500">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      </section>
    </div>
  );
};
