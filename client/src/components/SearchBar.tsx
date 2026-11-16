import React from "react";
import { Search, X, Filter, SlidersHorizontal } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeEntity: string | null;
  onClearEntity: () => void;
  activeSentiment: string;
  onSentimentChange: (sentiment: string) => void;
  selectedSource: string;
  onSourceChange: (source: string) => void;
  availableSources: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  activeEntity,
  onClearEntity,
  activeSentiment,
  onSentimentChange,
  selectedSource,
  onSourceChange,
  availableSources,
}) => {
  return (
    <div className="w-full space-y-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_6px_18px_rgba(15,23,42,0.035)] sm:p-4">
      <div className="flex flex-col gap-2.5 lg:flex-row">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search headlines, publishers, people or topics..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          />
          {searchTerm && (
            <button onClick={() => onSearchChange("")} aria-label="Clear search" className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 sm:flex-none">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={activeSentiment}
              onChange={e => onSentimentChange(e.target.value)}
              aria-label="Filter by sentiment"
              className="min-w-0 flex-1 cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Sentiment</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </label>
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 sm:flex-none">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedSource}
              onChange={e => onSourceChange(e.target.value)}
              aria-label="Filter by publisher"
              className="min-w-0 max-w-[150px] cursor-pointer truncate bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Publishers</option>
              {availableSources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {(activeEntity || activeSentiment !== "all" || selectedSource !== "All" || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs">
          <span className="font-semibold text-slate-500">Active filters</span>
          {searchTerm && (
            <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-indigo-700">
              Query: “{searchTerm}”
              <button onClick={() => onSearchChange("")} aria-label="Clear search filter" className="ml-1.5 hover:text-indigo-900"><X className="h-3 w-3" /></button>
            </span>
          )}
          {activeEntity && (
            <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-amber-700">
              Entity: {activeEntity}
              <button onClick={onClearEntity} aria-label="Clear entity filter" className="ml-1.5 hover:text-amber-900"><X className="h-3 w-3" /></button>
            </span>
          )}
          {activeSentiment !== "all" && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
              Sentiment: {activeSentiment}
              <button onClick={() => onSentimentChange("all")} aria-label="Clear sentiment filter" className="ml-1.5 hover:text-slate-900"><X className="h-3 w-3" /></button>
            </span>
          )}
          {selectedSource !== "All" && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
              Source: {selectedSource}
              <button onClick={() => onSourceChange("All")} aria-label="Clear publisher filter" className="ml-1.5 hover:text-slate-900"><X className="h-3 w-3" /></button>
            </span>
          )}
          <button onClick={() => { onSearchChange(""); onClearEntity(); onSentimentChange("all"); onSourceChange("All"); }} className="ml-1 font-semibold text-slate-500 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-rose-700">Clear all</button>
        </div>
      )}
    </div>
  );
};
