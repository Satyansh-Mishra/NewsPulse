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
  availableSources
}) => {
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 shadow-lg shadow-black/20 backdrop-blur-sm space-y-3">
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search news, topics, companies, or events..."
            className="w-full pl-10 pr-9 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <select
              value={activeSentiment}
              onChange={(e) => onSentimentChange(e.target.value)}
              aria-label="Filter by sentiment"
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-100">All Sentiment</option>
              <option value="positive" className="bg-slate-900 text-emerald-400">Positive</option>
              <option value="neutral" className="bg-slate-900 text-slate-300">Neutral</option>
              <option value="negative" className="bg-slate-900 text-rose-400">Negative</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <select
              value={selectedSource}
              onChange={(e) => onSourceChange(e.target.value)}
              aria-label="Filter by publisher"
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer max-w-[120px] truncate"
            >
              <option value="All" className="bg-slate-900 text-slate-100">All Publishers</option>
              {availableSources.map(s => (
                <option key={s} value={s} className="bg-slate-900 text-slate-200">{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {(activeEntity || activeSentiment !== "all" || selectedSource !== "All" || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium">Active Filters:</span>

          {searchTerm && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Query: "{searchTerm}"
              <button onClick={() => onSearchChange("")} className="ml-1.5 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeEntity && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Entity: {activeEntity}
              <button onClick={onClearEntity} className="ml-1.5 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeSentiment !== "all" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              Sentiment: {activeSentiment}
              <button onClick={() => onSentimentChange("all")} className="ml-1.5 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedSource !== "All" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              Source: {selectedSource}
              <button onClick={() => onSourceChange("All")} className="ml-1.5 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={() => {
              onSearchChange("");
              onClearEntity();
              onSentimentChange("all");
              onSourceChange("All");
            }}
            className="text-slate-400 hover:text-rose-400 underline ml-2 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

