import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { TrendsView } from "./pages/TrendsView";
import { ComparisonView } from "./pages/ComparisonView";
import { FeedModal } from "./components/FeedModal";
import { AIChatDrawer } from "./components/AIChatDrawer";
import { triggerIngest } from "./services/api";
import { EntityType } from "./components/EntityTag";

export function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "trends" | "comparison">("dashboard");
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenFeedModal={() => setIsFeedModalOpen(true)}
        onToggleChatDrawer={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
        onSyncFeeds={handleSyncFeeds}
        isSyncing={isSyncing}
      />

      {syncNotice && (
        <div className="bg-indigo-600/20 border-b border-indigo-500/30 px-4 py-2 text-center text-xs font-medium text-indigo-300 animate-in fade-in">
          {syncNotice}
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">NewsPulse</span>
            <span className="text-slate-500">|</span>
            <span>AI News Intelligence & Trend Explorer</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-400">
            <span>FastAPI + ChromaDB</span>
            <span>•</span>
            <span>Express + Prisma</span>
            <span>•</span>
            <span>React + Vite</span>
          </div>
        </div>
      </footer>

      <FeedModal
        isOpen={isFeedModalOpen}
        onClose={() => setIsFeedModalOpen(false)}
        onSyncComplete={() => {
          setSyncNotice("Feed sources updated and synchronized.");
          setTimeout(() => setSyncNotice(null), 3000);
        }}
      />

      <AIChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        initialPrompt={chatInitialPrompt}
      />
    </div>
  );
}

export default App;

