import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { TrendsView } from "./pages/TrendsView";
import { ComparisonView } from "./pages/ComparisonView";
import { AIChatDrawer } from "./components/AIChatDrawer";
import { triggerIngest } from "./services/api";
import { EntityType } from "./components/EntityTag";

export function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "trends" | "comparison">("dashboard");
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>("");
  const [comparisonTopic, setComparisonTopic] = useState<string>("Tech");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleSyncFeeds = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      const res = await triggerIngest();
      setSyncNotice(res.message || "Feeds successfully ingested.");
      setTimeout(() => setSyncNotice(null), 4000);
    } catch {
      setSyncNotice("Sync request failed. Make sure backend is running.");
      setTimeout(() => setSyncNotice(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAskAI = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setIsChatDrawerOpen(true);
  };

  const handleCompareTopic = (topic: string) => {
    setComparisonTopic(topic);
    setActiveTab("comparison");
  };

  const handleSelectEntity = (name: string, _type: EntityType) => {
    setActiveTab("dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleChatDrawer={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
        onSyncFeeds={handleSyncFeeds}
        isSyncing={isSyncing}
      />

      {syncNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-center text-xs font-semibold text-emerald-800 animate-in fade-in">
          {syncNotice}
        </div>
      )}

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-7 lg:px-10 py-8">
        {activeTab === "dashboard" && (
          <Dashboard
            onSelectEntity={handleSelectEntity}
            onAskAI={handleAskAI}
            onCompareTopic={handleCompareTopic}
          />
        )}
        {activeTab === "trends" && (
          <TrendsView
            onSelectEntity={handleSelectEntity}
            onCompareTopic={handleCompareTopic}
          />
        )}
        {activeTab === "comparison" && (
          <ComparisonView
            initialTopic={comparisonTopic}
            onAskAI={handleAskAI}
          />
        )}
      </main>

      <footer className="mt-10 border-t border-slate-200 bg-white py-5 text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-7 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">NewsPulse</span>
            <span className="text-slate-300">|</span>
            <span>AI News Intelligence & Trend Explorer</span>
          </div>
          <div className="flex items-center space-x-3 font-mono text-[10px] uppercase tracking-wider text-slate-400">
            <span>FastAPI + ChromaDB</span>
            <span>•</span>
            <span>Express + Prisma</span>
            <span>•</span>
            <span>React + Vite</span>
          </div>
        </div>
      </footer>

      <AIChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        initialPrompt={chatInitialPrompt}
      />
    </div>
  );
}

export default App;
