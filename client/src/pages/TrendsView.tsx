import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import {
  TrendingUp,
  Building2,
  User,
  MapPin,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { TrendData, TopicCluster } from "../types";
import { fetchTrends } from "../services/api";
import { EntityTag, EntityType } from "../components/EntityTag";

interface TrendsViewProps {
  onSelectEntity: (name: string, type: EntityType) => void;
  onCompareTopic: (topic: string) => void;
}

export const TrendsView: React.FC<TrendsViewProps> = ({
  onSelectEntity,
  onCompareTopic
}) => {
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEntityTab, setActiveEntityTab] = useState<"organizations" | "people" | "locations">("organizations");

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const data = await fetchTrends();
      setTrends(data);
    } catch {
      setTrends(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 mx-auto border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500">Calculating trend momentum and semantic vector clusters...</p>
      </div>
    );
  }

  if (!trends) {
    return (
      <div className="py-16 text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <p className="text-sm text-gray-500">Unable to load trend data. Make sure backend is connected.</p>
      </div>
    );
  }

  const sentimentData = [
    { name: "Positive", count: trends.sentimentDistribution.positive, color: "#10b981" },
    { name: "Neutral", count: trends.sentimentDistribution.neutral, color: "#6366f1" },
    { name: "Negative", count: trends.sentimentDistribution.negative, color: "#f43f5e" }
  ];

  const currentEntityList =
    activeEntityTab === "organizations"
      ? trends.entityTrends.organizations
      : activeEntityTab === "people"
      ? trends.entityTrends.people
      : trends.entityTrends.locations;

  const currentEntityType: EntityType =
    activeEntityTab === "organizations"
      ? "ORG"
      : activeEntityTab === "people"
      ? "PERSON"
      : "GPE";

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-700">
          <TrendingUp className="w-4 h-4" />
          <span>What's gaining momentum</span>
        </div>
        <h1 className="text-3xl font-bold tracking-[-0.05em] text-slate-950 sm:text-4xl">
          The stories behind the numbers
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Track the people, places and ideas showing up across publishers, alongside the sentiment shaping their coverage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Sentiment Trajectory Over Time</h2>
              <p className="text-xs text-gray-500">Volume and polarity fluctuations across recent reports</p>
            </div>
            <span className="text-[11px] font-mono text-gray-400">Timeline Data</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.timeline.length > 0 ? trends.timeline : [{ date: "Today", positive: 1, neutral: 1, negative: 0, total: 2 }]}>
                <defs>
                  <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Area type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPositive)" name="Positive" />
                <Area type="monotone" dataKey="neutral" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorNeutral)" name="Neutral" />
                <Area type="monotone" dataKey="negative" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorNegative)" name="Negative" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">Sentiment Polarity Distribution</h2>
            <p className="text-xs text-gray-500 mb-4">VADER-analyzed story polarity split</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase font-mono text-emerald-700 block">Pos</span>
              <span className="text-sm font-bold text-emerald-800">{trends.sentimentDistribution.positive}</span>
            </div>
            <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-[10px] uppercase font-mono text-gray-600 block">Neu</span>
              <span className="text-sm font-bold text-gray-800">{trends.sentimentDistribution.neutral}</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
              <span className="text-[10px] uppercase font-mono text-rose-700 block">Neg</span>
              <span className="text-sm font-bold text-rose-800">{trends.sentimentDistribution.negative}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Entity Velocity Leaderboard</h2>
            <span className="text-xs font-mono text-indigo-600 font-medium">NER spaCy</span>
          </div>

          <div className="flex rounded-lg bg-gray-100 p-1 mb-4 border border-gray-200">
            <button
              onClick={() => setActiveEntityTab("organizations")}
              className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors ${
                activeEntityTab === "organizations"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Orgs
            </button>
            <button
              onClick={() => setActiveEntityTab("people")}
              className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors ${
                activeEntityTab === "people"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              People
            </button>
            <button
              onClick={() => setActiveEntityTab("locations")}
              className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors ${
                activeEntityTab === "locations"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Places
            </button>
          </div>

          <div className="space-y-2">
            {currentEntityList.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No entities recorded</p>
            ) : (
              currentEntityList.slice(0, 8).map((item, idx) => (
                <div
                  key={item.name}
                  onClick={() => onSelectEntity(item.name, currentEntityType)}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-2.5 truncate mr-2">
                    <span className="text-xs font-mono text-gray-400 w-4">{idx + 1}.</span>
                    <EntityTag type={currentEntityType} name={item.name} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-gray-700 px-2 py-0.5 rounded bg-white border border-gray-200">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Prominent Semantic Topic Clusters
              </h2>
              <p className="text-xs text-gray-500">K-Means clustering over ChromaDB dense sentence embeddings</p>
            </div>
            <span className="text-xs font-mono text-indigo-600 font-medium">MiniLM-L6-v2</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.topicClusters.map((cluster) => (
              <div
                key={cluster.cluster_id}
                className="bg-gray-50/60 border border-gray-200 hover:border-indigo-400 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 truncate max-w-[180px]">
                      {cluster.topic_label}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {cluster.size} articles
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {cluster.top_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-gray-600 border border-gray-200"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] uppercase font-mono text-gray-400 block font-semibold">Sample Headlines</span>
                    {cluster.sample_titles.slice(0, 2).map((t, idx) => (
                      <p key={idx} className="text-xs text-gray-600 line-clamp-1 italic">
                        • {t}
                      </p>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onCompareTopic(cluster.topic_label)}
                  className="mt-2 w-full flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                >
                  <span>Compare Publisher Coverage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
