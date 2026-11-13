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
  Cell,
  Legend
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
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 mx-auto border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Computing entity momentum and vector clusters...</p>
      </div>
    );
  }

  if (!trends || trends.totalArticles === 0) {
    return (
      <div className="py-16 text-center bg-slate-900/30 border border-slate-800 rounded-xl p-8">
        <p className="text-sm text-slate-300">No trend intelligence available yet.</p>
        <p className="text-xs text-slate-500 mt-1">Please sync RSS feeds to generate analytics.</p>
      </div>
    );
  }

  const sentimentData = [
    { name: "Positive", count: trends.sentimentDistribution.positive, color: "#10b981" },
    { name: "Neutral", count: trends.sentimentDistribution.neutral, color: "#64748b" },
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
    <div className="space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono font-medium uppercase tracking-wider mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>Real-time Momentum Engine</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Trend Momentum & Vector Cluster Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Algorithmic tracking of entity velocity, sentiment trajectories, and semantic topic clusters across publishers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Sentiment Trajectory Over Time</h2>
              <p className="text-xs text-slate-400">Volume and polarity fluctuations across recent reports</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Timeline Data</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.timeline.length > 0 ? trends.timeline : [{ date: "Today", positive: 1, neutral: 1, negative: 0, total: 2 }]}>
                <defs>
                  <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem"
                  }}
                />
                <Area type="monotone" dataKey="positive" stroke="#10b981" fillOpacity={1} fill="url(#colorPositive)" name="Positive" />
                <Area type="monotone" dataKey="neutral" stroke="#6366f1" fillOpacity={1} fill="url(#colorNeutral)" name="Neutral" />
                <Area type="monotone" dataKey="negative" stroke="#f43f5e" fillOpacity={1} fill="url(#colorNegative)" name="Negative" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-1">Sentiment Polarity Distribution</h2>
            <p className="text-xs text-slate-400 mb-4">VADER-analyzed story polarity split</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" stroke="#cbd5e1" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem"
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

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] uppercase font-mono text-emerald-400 block">Pos</span>
              <span className="text-sm font-bold text-emerald-300">{trends.sentimentDistribution.positive}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Neu</span>
              <span className="text-sm font-bold text-slate-200">{trends.sentimentDistribution.neutral}</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] uppercase font-mono text-rose-400 block">Neg</span>
              <span className="text-sm font-bold text-rose-300">{trends.sentimentDistribution.negative}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Entity Velocity Leaderboard</h2>
            <span className="text-xs font-mono text-indigo-400">NER SPAcY</span>
          </div>

          <div className="flex rounded-lg bg-slate-950 p-1 mb-4 border border-slate-800">
            <button
              onClick={() => setActiveEntityTab("organizations")}
              className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors ${
                activeEntityTab === "organizations"
                  ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Orgs
            </button>
            <button
              onClick={() => setActiveEntityTab("people")}
              className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors ${
                activeEntityTab === "people"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              People
            </button>
            <button
              onClick={() => setActiveEntityTab("locations")}
              className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors ${
                activeEntityTab === "locations"
                  ? "bg-amber-600/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Places
            </button>
          </div>

          <div className="space-y-2">
            {currentEntityList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No entities recorded</p>
            ) : (
              currentEntityList.slice(0, 8).map((item, idx) => (
                <div
                  key={item.name}
                  onClick={() => onSelectEntity(item.name, currentEntityType)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-2.5 truncate mr-2">
                    <span className="text-xs font-mono text-slate-500 w-4">{idx + 1}.</span>
                    <EntityTag type={currentEntityType} name={item.name} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-300 px-2 py-0.5 rounded bg-slate-800">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                Prominent Semantic Topic Clusters
              </h2>
              <p className="text-xs text-slate-400">K-Means clustering over ChromaDB dense sentence embeddings</p>
            </div>
            <span className="text-xs font-mono text-indigo-400">MiniLM-L6-v2</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.topicClusters.map((cluster) => (
              <div
                key={cluster.cluster_id}
                className="bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">
                      {cluster.topic_label}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {cluster.size} articles
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {cluster.top_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Sample Headlines</span>
                    {cluster.sample_titles.slice(0, 2).map((t, idx) => (
                      <p key={idx} className="text-xs text-slate-300 line-clamp-1 italic">
                        • {t}
                      </p>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onCompareTopic(cluster.topic_label)}
                  className="mt-2 w-full flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
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

