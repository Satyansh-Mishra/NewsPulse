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

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSelectEntity,
  onAskAI,
  onCompareTopic
}) => {
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) {
        const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
        return `${diffMins}m ago`;
      }
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return `Yesterday`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const getSentimentPill = () => {
    const score = article.sentimentScore;
    const pct = Math.round(Math.abs(score) * 100);

    switch (article.sentiment) {
      case "positive":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3 h-3 mr-1 text-emerald-400" />
            Positive ({pct}%)
          </span>
        );
      case "negative":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <TrendingDown className="w-3 h-3 mr-1 text-rose-400" />
            Negative ({pct}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-300 border border-slate-500/20">
            <Minus className="w-3 h-3 mr-1 text-slate-400" />
            Neutral
          </span>
        );
    }
  };

  const entities = article.entities || {};
  const hasEntities = (entities.PERSON?.length || 0) + (entities.ORG?.length || 0) + (entities.GPE?.length || 0) > 0;

  return (
    <article className="group relative flex flex-col justify-between bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {article.source}
            </span>
            {article.category && (
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {article.category}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {getSentimentPill()}
            <span className="flex items-center text-xs text-slate-400" title={article.publishedAt}>
              <Clock className="w-3 h-3 mr-1 text-slate-500" />
              {formatTime(article.publishedAt)}
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2.5 leading-snug">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-1"
          >
            <span>{article.title}</span>
            <ExternalLink className="w-3.5 h-3.5 mt-1 shrink-0 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
          </a>
        </h3>

        <p className="text-sm text-slate-300 line-clamp-3 mb-4 leading-relaxed font-normal">
          {article.summary || article.content}
        </p>

        {hasEntities && (
          <div className="mb-4 pt-3 border-t border-slate-800/80">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
              Extracted Entities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(entities.ORG || []).slice(0, 3).map((org) => (
                <EntityTag
                  key={`org-${org}`}
                  type="ORG"
                  name={org}
                  onClick={(n, t) => onSelectEntity && onSelectEntity(n, t)}
                />
              ))}
              {(entities.PERSON || []).slice(0, 2).map((person) => (
                <EntityTag
                  key={`person-${person}`}
                  type="PERSON"
                  name={person}
                  onClick={(n, t) => onSelectEntity && onSelectEntity(n, t)}
                />
              ))}
              {(entities.GPE || []).slice(0, 2).map((loc) => (
                <EntityTag
                  key={`gpe-${loc}`}
                  type="GPE"
                  name={loc}
                  onClick={(n, t) => onSelectEntity && onSelectEntity(n, t)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={() => {
            const topic = article.topicLabel || article.category || (entities.ORG?.[0]) || article.source;
            if (onCompareTopic) onCompareTopic(topic);
          }}
          className="flex items-center space-x-1 text-slate-400 hover:text-indigo-400 transition-colors"
          title="Compare how other publishers cover this topic"
        >
          <GitCompare className="w-3.5 h-3.5 text-slate-500" />
          <span>Compare coverage</span>
        </button>

        <button
          onClick={() => {
            if (onAskAI) {
              onAskAI(`Tell me more about this news report from ${article.source}: "${article.title}"`);
            }
          }}
          className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </button>
      </div>
    </article>
  );
};

