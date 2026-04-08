import { useState, useEffect } from "react";
import { CheckCircle2, Clock, Bell, Circle } from "lucide-react";
import { api } from "../services/api";

const TrackerPanel = ({ caseId }) => {
  const [status, setStatus] = useState("intake");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!caseId) return;
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const data = await api.getCase(caseId);
        if (data && data.status) {
          setStatus(data.status); // 'intake', 'drafted', 'filed'
        }
      } catch (err) {
        console.error("Failed to fetch case status:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [caseId]);

  // Derived states
  const interpretedDone = true; // Always done if case exists
  const draftDone = status === "drafted" || status === "filed";
  const draftActive = status === "intake";
  
  const filedDone = status === "filed";
  const filedActive = status === "drafted";
  
  const nudgeActive = status === "filed";

  const steps = [
    { 
      label: "Information Gathering", 
      desc: "Legal sections identified", 
      status: "done", 
      icon: CheckCircle2 
    },
    { 
      label: "Document Drafted", 
      desc: "FIR generated & ready", 
      status: draftDone ? "done" : (draftActive ? "active" : "pending"), 
      icon: CheckCircle2 
    },
    { 
      label: "Filed with Authorities", 
      desc: "Waiting for response", 
      status: filedDone ? "done" : (filedActive ? "active" : "pending"), 
      icon: Clock 
    },
    { 
      label: "Auto-Nudge Scheduled", 
      desc: "Triggers if no response", 
      status: nudgeActive ? "active" : "pending", 
      icon: Bell 
    },
  ];

  if (!caseId) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Start a chat to activate tracker.
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-foreground">Case Tracker</h3>
        {loading && <span className="text-[10px] text-muted-foreground animate-pulse">Syncing...</span>}
      </div>
      <p className="text-xs text-muted-foreground mb-4">Advisory Agent monitors progress</p>

      <div className="space-y-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isDone = step.status === "done";
          const isActive = step.status === "active";
          const isPending = step.status === "pending";

          return (
            <div key={i} className="flex gap-3">
              {/* Timeline line + icon */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex-shrink-0 rounded-full p-1 ${
                    isDone
                      ? "text-success"
                      : isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground/40"
                  }`}
                >
                  {isPending ? (
                    <Circle className="h-5 w-5" />
                  ) : (
                    <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-px flex-1 min-h-[28px] mt-1 ${
                      isDone ? "bg-success" : "bg-border"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-5">
                <p
                  className={`text-sm font-medium ${
                    isPending ? "text-muted-foreground/50" : "text-foreground"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
                {isActive && (
                  <span className="inline-flex items-center mt-1.5 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-full bg-primary/10 text-primary">
                    <Clock className="h-3 w-3 mr-1" />
                    In Progress
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackerPanel;
