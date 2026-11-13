import React from "react";
import {
  Activity,
  LayoutDashboard,
  TrendingUp,
  GitCompare,
  Rss,
  Sparkles,
  RefreshCw
} from "lucide-react";

interface NavbarProps {
  activeTab: "dashboard" | "trends" | "comparison";
  onTabChange: (tab: "dashboard" | "trends" | "comparison") => void;
  onOpenFeedModal: () => void;
  onToggleChatDrawer: () => void;
  onSyncFeeds: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenFeedModal,
  onToggleChatDrawer,
  onSyncFeeds,
  isSyncing
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div
            onClick={() => onTabChange("dashboard")}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  News<span className="text-indigo-400">Pulse</span>
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI INTEL
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Trend Explorer & Narrative Intelligence
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800">
            <button
              onClick={() => onTabChange("dashboard")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Live Intel</span>
            </button>

            <button
              onClick={() => onTabChange("trends")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "trends"
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trend Momentum</span>
            </button>

            <button
              onClick={() => onTabChange("comparison")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "comparison"
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>Narrative Compare</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onSyncFeeds}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all disabled:opacity-50"
            title="Sync all RSS feeds now"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncing ? "animate-spin text-indigo-400" : ""}`} />
            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync Feeds"}</span>
          </button>

          <button
            onClick={onOpenFeedModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all"
            title="Manage RSS Sources"
          >
            <Rss className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Feed Sources</span>
          </button>

          <button
            onClick={onToggleChatDrawer}
            className="relative flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      <div className="md:hidden flex border-t border-slate-800/80 bg-slate-950 px-2 py-1.5 justify-around">
        <button
          onClick={() => onTabChange("dashboard")}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium ${
            activeTab === "dashboard" ? "bg-indigo-600/20 text-indigo-300" : "text-slate-400"
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Intel</span>
        </button>
        <button
          onClick={() => onTabChange("trends")}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium ${
            activeTab === "trends" ? "bg-indigo-600/20 text-indigo-300" : "text-slate-400"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Trends</span>
        </button>
        <button
          onClick={() => onTabChange("comparison")}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium ${
            activeTab === "comparison" ? "bg-indigo-600/20 text-indigo-300" : "text-slate-400"
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Compare</span>
        </button>
      </div>
    </header>
  );
};

