import React from "react";
import { ExternalLink, Clock, TrendingUp, TrendingDown, Minus, Sparkles, GitCompare } from "lucide-react";
import { Article } from "../types";
import { EntityTag, EntityType } from "./EntityTag";

interface ArticleCardProps {
  article: Article;
  onSelectEntity?: (name: string, type: EntityType) => void;
  onAskAI?: (prompt: string) => void;
  onCompareTopic?: (topic: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelectEntity, onAskAI, onCompareTopic }) => {
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      if (diffHours < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch { return dateStr; }
  };

  const getSentimentPill = () => {
    const pct = Math.round(Math.abs(article.sentimentScore) * 100);
    switch (article.sentiment) {
      case "positive":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TrendingUp className="w-3 h-3 mr-1" /> Positive ({pct}%)
          </span>
        );
      case "negative":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <TrendingDown className="w-3 h-3 mr-1" /> Negative ({pct}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <Minus className="w-3 h-3 mr-1" /> Neutral
          </span>
        );
    }
  };

  const entities = article.entities || {};
  const hasEntities = (entities.PERSON?.length || 0) + (entities.ORG?.length || 0) + (entities.GPE?.length || 0) > 0;

  return (
    <article className="group relative flex min-h-[290px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_16px_34px_rgba(15,23,42,0.09)]">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex max-w-[150px] truncate items-center rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-700">
              {article.source}
            </span>
            {article.category && (
              <span className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {article.category}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {getSentimentPill()}
          </div>
        </div>

        <h3 className="mb-2.5 text-[16px] font-bold leading-[1.4] tracking-[-0.035em] text-slate-950 transition-colors group-hover:text-indigo-700">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline">
            <span>{article.title}</span>
            <ExternalLink className="ml-1 inline h-3 w-3 align-baseline text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        </h3>

        <p className="mb-4 line-clamp-3 text-[12px] leading-[1.75] text-slate-600">
          {article.summary || article.content}
        </p>

        {hasEntities && (
          <div className="mb-4 border-t border-slate-100 pt-3">
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">In this story</span>
            <div className="flex flex-wrap gap-1.5">
              {(entities.ORG || []).slice(0, 3).map(org => (
                <EntityTag key={`org-${org}`} type="ORG" name={org} onClick={(n, t) => onSelectEntity?.(n, t)} />
              ))}
              {(entities.PERSON || []).slice(0, 2).map(p => (
                <EntityTag key={`person-${p}`} type="PERSON" name={p} onClick={(n, t) => onSelectEntity?.(n, t)} />
              ))}
              {(entities.GPE || []).slice(0, 2).map(loc => (
                <EntityTag key={`gpe-${loc}`} type="GPE" name={loc} onClick={(n, t) => onSelectEntity?.(n, t)} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <button
          onClick={() => onCompareTopic?.(article.topicLabel || article.category || entities.ORG?.[0] || article.source)}
          className="flex items-center gap-1.5 font-semibold text-slate-500 transition-colors hover:text-indigo-700"
        >
          <GitCompare className="h-3.5 w-3.5" />
          <span>Compare</span>
        </button>
        <span className="flex items-center text-[10px] font-medium text-slate-400" title={article.publishedAt}>
          <Clock className="mr-1 h-3 w-3" />
          {formatTime(article.publishedAt)}
        </span>
        <button
          onClick={() => onAskAI?.(`Tell me more about this news report from ${article.source}: "${article.title}"`)}
          className="flex items-center gap-1.5 font-semibold text-indigo-700 transition-colors hover:text-indigo-900"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ask AI</span>
        </button>
      </div>
    </article>
  );
};
