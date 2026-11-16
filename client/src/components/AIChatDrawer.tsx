import React, { useState, useEffect } from "react";
import { X, Send, Sparkles, Bot, User, ExternalLink, ChevronDown, ChevronUp, Bookmark, Trash2 } from "lucide-react";
import { ChatMessage, Citation } from "../types";
import { queryAIChat } from "../services/api";

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose, initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = localStorage.getItem("newsPulseChatHistory");
    return stored ? JSON.parse(stored) : [
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I am NewsPulse AI, your real-time news intelligence assistant. I synthesize cross-publisher reporting using RAG vector search and provide verified source citations. How can I help you investigate today's news?",
        timestamp: new Date()
      }
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem("newsPulseChatHistory", JSON.stringify(messages));
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await queryAIChat(query, messages, 5);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        citations: response.citations,
        confidence: response.confidence_score,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error connecting to the news vector intelligence service. Please make sure the backend and NLP worker are running.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const newWelcome: ChatMessage[] = [
      {
        id: "welcome",
        role: "assistant",
        content: "Conversation cleared. Ask any question about recent headlines, publisher narratives, or emerging trends.",
        timestamp: new Date()
      }
    ];
    setMessages(newWelcome);
    localStorage.removeItem("newsPulseChatHistory");
  };

  const samplePrompts = [
    "What are the dominant tech trends today?",
    "Summarize perspectives on global market developments",
    "Which entities are appearing most frequently in recent headlines?"
  ];

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l border-gray-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/60 backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 p-[1px]">
            <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-gray-900">NewsPulse AI Assistant</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
                RAG ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Synthesizing live RSS vector embeddings</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={clearChat} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Clear Chat History">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`flex items-start gap-2.5 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-indigo-600 border border-gray-200"}`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-none shadow-sm"}`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono mb-2">
                      <span className="flex items-center gap-1 font-semibold text-indigo-600">
                        <Bookmark className="w-3 h-3" /> Sources Cited ({msg.citations.length})
                      </span>
                      {msg.confidence !== undefined && (
                        <span>Match: {Math.round(msg.confidence * 100)}%</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {msg.citations.map(cit => {
                        const citKey = `${msg.id}-${cit.citation_id}`;
                        const isExpanded = expandedCitationId === citKey;
                        return (
                          <div key={citKey} className="bg-white border border-gray-200 rounded-lg p-2 text-xs transition-colors">
                            <div onClick={() => setExpandedCitationId(isExpanded ? null : citKey)} className="flex items-center justify-between cursor-pointer">
                              <div className="flex items-center space-x-1.5 truncate mr-2">
                                <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">{cit.citation_id}</span>
                                <span className="font-semibold text-gray-800 truncate">{cit.source}:</span>
                                <span className="text-gray-500 truncate max-w-[170px]">{cit.title}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-gray-500 shrink-0">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="mt-2 pt-2 border-t border-gray-100/60 text-gray-700 space-y-1.5">
                                <p className="text-[11px] italic text-gray-500 leading-normal">"{cit.excerpt}"</p>
                                {cit.url && (
                                  <a href={cit.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[11px] text-indigo-600 hover:text-indigo-700">
                                    <span>Read original article</span>
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-100 text-indigo-600 border border-gray-200 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 rounded-tl-none flex items-center space-x-2">
              <span className="text-xs text-gray-500">Scanning vector memory & synthesizing...</span>
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={null as any} />
      </div>

      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-[11px] font-mono uppercase text-gray-400 mb-1.5">Suggested Queries</p>
          <div className="space-y-1">
            {samplePrompts.map(prompt => (
              <button key={prompt} onClick={() => handleSend(prompt)} className="w-full text-left text-xs p-1.5 rounded bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-300 text-gray-600 truncate transition-colors">
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 border-t border-gray-100 bg-white">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask AI about news, trends, or narrative coverage..." className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all" />
          <button type="submit" disabled={!input.trim() || isLoading} className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
