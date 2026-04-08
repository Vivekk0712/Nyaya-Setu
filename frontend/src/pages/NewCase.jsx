import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MessageSquare, FileText, Activity, X, Plus } from "lucide-react";
import { Button } from "../components/ui/Button";
import ChatPanel from "../components/ChatPanel";
import DocumentPanel from "../components/DocumentPanel";
import TrackerPanel from "../components/TrackerPanel";

const tabs = [
  { id: "chat",     label: "Chat",     icon: MessageSquare },
  { id: "document", label: "Document", icon: FileText },
];

const NewCase = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // If opened from CaseHistory, ?caseId=... pre-loads that case's chat
  const urlCaseId = searchParams.get("caseId") || null;
  const isExistingCase = !!urlCaseId;

  const [activeTab, setActiveTab] = useState("chat");
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [currentCaseId, setCurrentCaseId] = useState(urlCaseId);
  const [readyToDraft, setReadyToDraft] = useState(false);

  const handleCaseCreated = (caseId) => {
    setCurrentCaseId(caseId);
  };

  const handleReadyToDraft = (caseId) => {
    setReadyToDraft(true);
    setCurrentCaseId(caseId);
    setActiveTab("document");
  };

  const handleNewCase = () => {
    // Navigate to /new-case with no caseId param → fresh session
    navigate("/new-case", { replace: false });
    // Force a re-mount by navigating away then back isn't clean,
    // so just reload the page for now
    window.location.href = "/new-case";
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">

      {/* Top bar: title + New Case button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {isExistingCase ? "Existing Case" : "New Case"}
          </span>
          {currentCaseId && (
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
              {currentCaseId.slice(0, 8)}…
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleNewCase}
          className="gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New Case
        </Button>
      </div>

      {/* Desktop split layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-[420px] border-r border-border flex flex-col">
          <ChatPanel
            key={currentCaseId || "new"}   // re-mount when case changes
            caseId={currentCaseId}
            onCaseCreated={handleCaseCreated}
            onReadyToDraft={handleReadyToDraft}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Tracker toggle */}
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

          {/* Tracker dropdown */}
          {trackerOpen && (
            <div className="absolute top-12 right-3 z-30 w-80 bg-card border border-border rounded-xl shadow-lg animate-fade-in">
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="text-sm font-semibold text-foreground">Case Tracker</span>
                <button onClick={() => setTrackerOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <TrackerPanel caseId={currentCaseId} />
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <DocumentPanel caseId={currentCaseId} readyToDraft={readyToDraft} />
          </div>
        </div>
      </div>

      {/* Mobile tabbed layout */}
      <div className="flex flex-col flex-1 overflow-hidden md:hidden">
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

        {trackerOpen && (
          <div className="bg-card border-b border-border animate-fade-in">
            <div className="flex items-center justify-between px-4 pt-2">
              <span className="text-sm font-semibold text-foreground">Case Tracker</span>
              <button onClick={() => setTrackerOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <TrackerPanel caseId={currentCaseId} />
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && (
            <ChatPanel
              key={currentCaseId || "new"}
              caseId={currentCaseId}
              onCaseCreated={handleCaseCreated}
              onReadyToDraft={handleReadyToDraft}
            />
          )}
          {activeTab === "document" && (
            <DocumentPanel caseId={currentCaseId} readyToDraft={readyToDraft} />
          )}
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
