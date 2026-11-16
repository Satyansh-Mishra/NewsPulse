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
    <div className="space-y-7">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-700">
          <GitCompare className="w-4 h-4" />
          <span>Publisher perspective</span>
        </div>
        <h1 className="text-3xl font-bold tracking-[-0.05em] text-slate-950 sm:text-4xl">
          Compare the coverage
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          See how different publishers cover the same subject, from tone and framing to the details they emphasize.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search a topic, company or event..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <GitCompare className="w-4 h-4" />
            <span>Analyze Topic</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="mr-1 text-[11px] font-semibold text-slate-500">Try a topic</span>
          {PRESET_TOPICS.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setTopic(preset);
                setInputValue(preset);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                topic.toLowerCase() === preset.toLowerCase()
                  ? "bg-indigo-50 text-indigo-800 ring-1 ring-inset ring-indigo-200"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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
          <p className="text-xs text-slate-500">Comparing publisher coverage...</p>
        </div>
      ) : !data || data.totalArticles === 0 ? (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="text-base font-bold text-slate-900">No coverage found for "{topic}"</h3>
          <p className="mx-auto max-w-md text-xs leading-5 text-slate-500">
            Try searching for a broader topic like "Tech", "Business", or click "Sync Feeds" to fetch latest reports.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-teal-50/60 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-indigo-800">
              <Sparkles className="w-4 h-4" />
              <span>Coverage overview · {data.topic}</span>
            </div>
            <p className="text-sm leading-7 text-slate-700">
              {data.summaryAnalysis}
            </p>

            {data.consensusEntities.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-indigo-100 pt-4">
                <span className="text-xs font-semibold text-slate-600">Common entities</span>
                {data.consensusEntities.slice(0, 6).map((e) => (
                  <span
                    key={e.name}
                    className="inline-flex items-center rounded-full border border-indigo-100 bg-white px-2.5 py-1 text-xs font-medium text-indigo-800"
                  >
                    {e.name} ({e.count})
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-950">Sentiment by publisher</h2>
                <p className="mt-1 text-xs text-slate-500">Average story sentiment from -1.0 to +1.0</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{data.publishers.length} publishers</span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.sentimentComparison}
                  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="source" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[-1, 1]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1.5} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.12)"
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
            <h2 className="mb-3 text-base font-bold tracking-tight text-slate-950">
              Publisher breakdown <span className="ml-1 text-xs font-medium text-slate-500">({data.publishers.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.publishers.map((pub) => {
                const isPos = pub.dominantSentiment === "positive";
                const isNeg = pub.dominantSentiment === "negative";

                return (
                  <div
                    key={pub.source}
                    className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.035)] transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-indigo-600" />
                          <h3 className="text-sm font-bold text-slate-950">{pub.source}</h3>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                          {pub.articleCount} {pub.articleCount === 1 ? "article" : "articles"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-slate-500">Tone</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                            isPos
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : isNeg
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
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
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Framing
                        </span>
                        <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                          {pub.narrativeFraming}
                        </p>
                      </div>

                      {pub.keyEntities.length > 0 && (
                        <div>
                          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
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
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Sample Headlines
                          </span>
                          <ul className="space-y-1">
                            {pub.sampleHeadlines.map((hl, i) => (
                              <li key={i} className="line-clamp-2 text-xs italic text-slate-600">
                                • {hl}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onAskAI(`Compare the editorial tone of ${pub.source} on ${topic} with other news outlets.`)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
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
