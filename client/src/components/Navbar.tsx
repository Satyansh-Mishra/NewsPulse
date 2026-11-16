import React from "react";
import { Activity, LayoutDashboard, TrendingUp, GitCompare, Sparkles, RefreshCw } from "lucide-react";

interface NavbarProps {
  activeTab: "dashboard" | "trends" | "comparison";
  onTabChange: (tab: "dashboard" | "trends" | "comparison") => void;
  onToggleChatDrawer: () => void;
  onSyncFeeds: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onToggleChatDrawer, onSyncFeeds, isSyncing }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-7 lg:px-10 h-[76px] flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-8">
          <button onClick={() => onTabChange("dashboard")} className="flex items-center gap-3 text-left group">
            <div className="flex items-center justify-center w-10 h-10 rounded-[14px] bg-slate-950 text-white shadow-lg shadow-slate-900/10">
              <Activity className="w-[19px] h-[19px] text-teal-300" strokeWidth={2.2} />
            </div>
            <div className="block">
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-extrabold tracking-[-0.06em] text-slate-950 group-hover:text-indigo-700 transition-colors">
                  NewsPulse
                </span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.13em] text-indigo-700">
                  Intelligence
                </span>
              </div>
              <p className="hidden text-[11px] text-slate-500 sm:block">The signal behind the headlines</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {(["dashboard", "trends", "comparison"] as const).map((tab) => {
              const labels: Record<string, string> = { dashboard: "News desk", trends: "Trends", comparison: "Compare" };
              const icons: Record<string, React.ReactNode> = {
                dashboard: <LayoutDashboard className="w-4 h-4" />, 
                trends: <TrendingUp className="w-4 h-4" />, 
                comparison: <GitCompare className="w-4 h-4" />
              };
              return (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
                    activeTab === tab
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {icons[tab]}
                  <span>{labels[tab]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onSyncFeeds}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-indigo-600" : "text-slate-400"}`} />
            <span className="hidden sm:inline">{isSyncing ? "Syncing" : "Refresh"}</span>
          </button>

          <button
            onClick={onToggleChatDrawer}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-950 hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span className="hidden sm:inline">Ask NewsPulse</span>
            <span className="sm:hidden">AI</span>
          </button>
        </div>
      </div>

      <div className="md:hidden flex border-t border-slate-100 bg-white px-2 py-1.5 justify-around">
        {(["dashboard", "trends", "comparison"] as const).map((tab) => {
          const labels: Record<string, string> = { dashboard: "News desk", trends: "Trends", comparison: "Compare" };
          const icons: Record<string, React.ReactNode> = {
            dashboard: <LayoutDashboard className="w-3.5 h-3.5" />,
            trends: <TrendingUp className="w-3.5 h-3.5" />,
            comparison: <GitCompare className="w-3.5 h-3.5" />
          };
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                activeTab === tab ? "bg-slate-100 text-slate-950" : "text-slate-500"
              }`}
            >
              {icons[tab]}
              <span>{labels[tab]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
