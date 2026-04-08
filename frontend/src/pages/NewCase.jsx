import { useState } from "react";
import { MessageSquare, FileText, Activity, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import ChatPanel from "../components/ChatPanel";
import DocumentPanel from "../components/DocumentPanel";
import TrackerPanel from "../components/TrackerPanel";

const tabs = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "document", label: "Document", icon: FileText },
];

const NewCase = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [trackerOpen, setTrackerOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      {/* Desktop split layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-[420px] border-r border-border flex flex-col">
          <ChatPanel />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Tracker toggle button */}
          <div className="absolute top-3 right-3 z-20">
            <Button
              size="sm"
              variant={trackerOpen ? "default" : "outline"}
              onClick={() => setTrackerOpen(!trackerOpen)}
              className="gap-1.5 shadow-sm"
            >
              <Activity className="h-4 w-4" />
              Tracker
            </Button>
          </div>

          {/* Tracker dropdown panel */}
          {trackerOpen && (
            <div className="absolute top-12 right-3 z-30 w-80 bg-card border border-border rounded-xl shadow-lg animate-fade-in">
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="text-sm font-semibold text-foreground">Case Tracker</span>
                <button onClick={() => setTrackerOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <TrackerPanel />
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <DocumentPanel />
          </div>
        </div>
      </div>

      {/* Mobile tabbed layout */}
      <div className="flex flex-col flex-1 overflow-hidden md:hidden">
        {/* Mobile tracker button */}
        <div className="flex items-center justify-end px-3 py-2 border-b border-border bg-card">
          <Button
            size="sm"
            variant={trackerOpen ? "default" : "outline"}
            onClick={() => setTrackerOpen(!trackerOpen)}
            className="gap-1.5"
          >
            <Activity className="h-4 w-4" />
            Tracker
          </Button>
        </div>

        {/* Mobile tracker panel */}
        {trackerOpen && (
          <div className="bg-card border-b border-border animate-fade-in">
            <div className="flex items-center justify-between px-4 pt-2">
              <span className="text-sm font-semibold text-foreground">Case Tracker</span>
              <button onClick={() => setTrackerOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <TrackerPanel />
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && <ChatPanel />}
          {activeTab === "document" && <DocumentPanel />}
        </div>

        <div className="border-t border-border bg-card flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewCase;
