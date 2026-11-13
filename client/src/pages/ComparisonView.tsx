import React, { useState, useEffect } from "react";
import {
  GitCompare,
  Search,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts";
import { ComparisonData } from "../types";
import { fetchComparison } from "../services/api";
import { EntityTag } from "../components/EntityTag";

interface ComparisonViewProps {
  initialTopic?: string;
  onAskAI: (prompt: string) => void;
}

const PRESET_TOPICS = [
  "Tech",
  "Artificial Intelligence",
  "Economy",
  "Markets",
  "World",
  "Google",
  "Apple",
  "OpenAI"
];

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  initialTopic = "Tech",
  onAskAI
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [inputValue, setInputValue] = useState(initialTopic);
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      setInputValue(initialTopic);
    }
  }, [initialTopic]);

  useEffect(() => {
    loadComparison(topic);
  }, [topic]);

  const loadComparison = async (targetTopic: string) => {
    if (!targetTopic.trim()) return;
    setLoading(true);
    try {
      const res = await fetchComparison(targetTopic.trim());
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setTopic(inputValue.trim());
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono font-medium uppercase tracking-wider mb-1">
          <GitCompare className="w-4 h-4" />
          <span>Cross-Publisher Narrative Lens</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Coverage Comparison & Narrative Bias Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Deconstruct how different news organizations frame identical storylines, examine sentiment divergence, and detect narrative bias.
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute inset-y-0 left-3.5 my-auto w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter story topic to compare (e.g. OpenAI, Inflation, Electric Vehicles)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition-colors flex items-center justify-center space-x-1.5"
          >
            <GitCompare className="w-4 h-4" />
            <span>Analyze Topic</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-mono text-slate-500 mr-1">Trending Topics:</span>
          {PRESET_TOPICS.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setTopic(preset);
                setInputValue(preset);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                topic.toLowerCase() === preset.toLowerCase()
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Comparing editorial angles and calculating narrative scores...</p>
        </div>
      ) : !data || data.totalArticles === 0 ? (
        <div className="py-16 text-center bg-slate-900/30 border border-slate-800 rounded-2xl p-8 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No coverage found for "{topic}"</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try searching for a broader topic like "Tech", "Business", or click "Sync Feeds" to fetch latest reports.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-900/60 border border-indigo-500/20 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Cross-Publisher Synthesis on "{data.topic}"</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {data.summaryAnalysis}
            </p>

            {data.consensusEntities.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Consensus Entities:</span>
                {data.consensusEntities.slice(0, 6).map((e) => (
                  <span
                    key={e.name}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    {e.name} ({e.count})
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Editorial Tone & Sentiment Comparison</h2>
                <p className="text-xs text-slate-400">Average sentiment polarity score per publishing outlet (-1.0 to +1.0)</p>
              </div>
              <span className="text-xs font-mono text-indigo-400">{data.publishers.length} Publishers</span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.sentimentComparison}
                  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="source" stroke="#cbd5e1" tick={{ fontSize: 11 }} />
                  <YAxis domain={[-1, 1]} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem"
                    }}
                    formatter={(val: number) => [`${val > 0 ? "+" : ""}${val.toFixed(2)}`, "Sentiment Index"]}
                  />
                  <Bar dataKey="sentimentScore" radius={[4, 4, 0, 0]}>
                    {data.sentimentComparison.map((entry, index) => {
                      const color = entry.sentimentScore > 0.05
                        ? "#10b981"
                        : entry.sentimentScore < -0.05
                        ? "#f43f5e"
                        : "#64748b";
                      return <Cell key={`bar-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white mb-3">
              Side-by-Side Publisher Breakdown ({data.publishers.length} Outlets)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.publishers.map((pub) => {
                const isPos = pub.dominantSentiment === "positive";
                const isNeg = pub.dominantSentiment === "negative";

                return (
                  <div
                    key={pub.source}
                    className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-indigo-400" />
                          <h3 className="text-sm font-bold text-white">{pub.source}</h3>
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {pub.articleCount} {pub.articleCount === 1 ? "article" : "articles"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400">Tone:</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                            isPos
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : isNeg
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {isPos ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : isNeg ? (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          ) : (
                            <Minus className="w-3 h-3 mr-1" />
                          )}
                          {pub.dominantSentiment} ({pub.avgSentiment > 0 ? "+" : ""}{pub.avgSentiment})
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                          Narrative Framing
                        </span>
                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                          {pub.narrativeFraming}
                        </p>
                      </div>

                      {pub.keyEntities.length > 0 && (
                        <div>
                          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                            Key Entities Emphasized
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {pub.keyEntities.map((ent) => (
                              <EntityTag key={ent} type="ORG" name={ent} />
                            ))}
                          </div>
                        </div>
                      )}

                      {pub.sampleHeadlines.length > 0 && (
                        <div>
                          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                            Sample Headlines
                          </span>
                          <ul className="space-y-1">
                            {pub.sampleHeadlines.map((hl, i) => (
                              <li key={i} className="text-xs text-slate-300 line-clamp-2 italic">
                                • {hl}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onAskAI(`Compare the editorial tone of ${pub.source} on ${topic} with other news outlets.`)}
                      className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Investigate in AI Assistant</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

