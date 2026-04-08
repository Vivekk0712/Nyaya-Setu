import { CheckCircle2, Clock, Bell, Circle } from "lucide-react";

const steps = [
  { label: "Case Interpreted", desc: "Legal sections identified", status: "done", icon: CheckCircle2 },
  { label: "Document Drafted", desc: "FIR generated & ready", status: "done", icon: CheckCircle2 },
  { label: "Filed with Authorities", desc: "Waiting for response", status: "active", icon: Clock },
  { label: "Auto-Nudge Scheduled", desc: "Triggers in 7 days if no response", status: "pending", icon: Bell },
];

const TrackerPanel = () => {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">Case Tracker</h3>
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
                      ? "text-primary"
                      : "text-muted-foreground/40"
                  }`}
                >
                  {isPending ? (
                    <Circle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-px flex-1 min-h-[28px] ${
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
                  <span className="inline-flex items-center mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
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
