import React, { useState, useEffect } from "react";
import { X, Rss, Plus, CheckCircle2, AlertCircle, Trash2, Power, RefreshCw } from "lucide-react";
import { FeedSource } from "../types";
import { fetchFeeds, addFeed, toggleFeed, deleteFeed, triggerIngest } from "../services/api";

interface FeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const FeedModal: React.FC<FeedModalProps> = ({ isOpen, onClose, onSyncComplete }) => {
  const [feeds, setFeeds] = useState<FeedSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Tech");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFeeds();
    }
  }, [isOpen]);

  const loadFeeds = async () => {
    setLoading(true);
    try {
      const data = await fetchFeeds();
      setFeeds(data.feeds || []);
    } catch {
      setStatusMessage({ text: "Failed to load feed sources", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const result = await addFeed({
        name: name.trim(),
        url: url.trim(),
        category
      });

      if (result.success) {
        setStatusMessage({ text: `Added feed "${name}" and initiated sync.`, type: "success" });
        setName("");
        setUrl("");
        await loadFeeds();
        if (onSyncComplete) onSyncComplete();
      }
    } catch (err: any) {
      setStatusMessage({
        text: err?.response?.data?.error || "Failed to add RSS feed. Check URL.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFeed = async (id: string) => {
    try {
      await toggleFeed(id);
      setFeeds(feeds.map(f => f.id === id ? { ...f, active: !f.active } : f));
    } catch {
      setStatusMessage({ text: "Could not update feed status", type: "error" });
    }
  };

  const handleDeleteFeed = async (id: string) => {
    try {
      await deleteFeed(id);
      setFeeds(feeds.filter(f => f.id !== id));
      setStatusMessage({ text: "Feed removed", type: "success" });
    } catch {
      setStatusMessage({ text: "Could not delete feed", type: "error" });
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setStatusMessage(null);
    try {
      const res = await triggerIngest();
      setStatusMessage({ text: res.message || "Feeds synchronized successfully", type: "success" });
      if (onSyncComplete) onSyncComplete();
    } catch {
      setStatusMessage({ text: "Ingestion failed. Check backend/NLP worker.", type: "error" });
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Feed Intelligence Manager</h2>
              <p className="text-xs text-slate-400">Configure RSS feeds & ingestion pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {statusMessage && (
            <div
              className={`flex items-center space-x-2 p-3 rounded-lg text-xs font-medium ${
                statusMessage.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleAddFeed} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-400" />
              Add Custom RSS Feed
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <input
                type="text"
                placeholder="Feed Name (e.g. Ars Technica)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="sm:col-span-4 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="url"
                placeholder="RSS URL (https://...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="sm:col-span-5 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Feed category"
                className="sm:col-span-3 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Tech">Tech</option>
                <option value="World">World</option>
                <option value="Business">Business</option>
                <option value="Science">Science</option>
                <option value="Politics">Politics</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Adding & Fetching...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Feed Source</span>
                </>
              )}
            </button>
          </form>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active Sources ({feeds.length})
              </h3>
              <button
                onClick={handleTriggerSync}
                disabled={syncing}
                className="flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-indigo-400" : ""}`} />
                <span>{syncing ? "Syncing Feeds..." : "Sync All Now"}</span>
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading feed sources...</div>
            ) : feeds.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No feed sources configured yet.</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {feeds.map((feed) => (
                  <div
                    key={feed.id}
                    className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-200 truncate">{feed.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {feed.category}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            feed.active ? "bg-emerald-400" : "bg-slate-600"
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{feed.url}</p>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleFeed(feed.id)}
                        className={`p-1.5 rounded-md transition-colors ${
                          feed.active
                            ? "text-emerald-400 hover:bg-emerald-500/10"
                            : "text-slate-500 hover:bg-slate-800"
                        }`}
                        title={feed.active ? "Pause Ingestion" : "Activate Ingestion"}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFeed(feed.id)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Feed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

