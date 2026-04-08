import {
  FileText,
  Scale,
  Clock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total Cases", value: "3", icon: FileText, color: "text-primary" },
  { label: "Active", value: "1", icon: Clock, color: "text-amber-500" },
  { label: "Resolved", value: "2", icon: CheckCircle2, color: "text-success" },
  { label: "Nudges Sent", value: "1", icon: TrendingUp, color: "text-primary" },
];

const recentCases = [
  {
    id: "NYS-2026-003",
    title: "Wrongful Restraint & Breach of Trust",
    status: "active",
    date: "08 Apr 2026",
    sections: "BNS 126(2), 316",
  },
  {
    id: "NYS-2026-002",
    title: "Consumer Product Defect Complaint",
    status: "resolved",
    date: "22 Mar 2026",
    sections: "CPA Section 2(6)",
  },
  {
    id: "NYS-2026-001",
    title: "Noise Pollution Complaint",
    status: "resolved",
    date: "10 Feb 2026",
    sections: "BNS Section 290",
  },
];

const statusBadge = (status: string) => {
  if (status === "active")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
        <Clock className="h-3 w-3" /> Active
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success">
      <CheckCircle2 className="h-3 w-3" /> Resolved
    </span>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, Rajesh</h1>
            <p className="text-sm text-muted-foreground">Your legal dashboard at a glance</p>
          </div>
          <Button onClick={() => navigate("/case")} className="gap-2 w-full sm:w-auto">
            <Scale className="h-4 w-4" />
            File New Case
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Pending Action</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Case NYS-2026-003 has been filed for 5 days. Auto-nudge will trigger in 2 days if no
              response is received.
            </p>
          </div>
        </div>

        {/* DigiLocker prompt */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Identity Verified</p>
              <p className="text-xs text-muted-foreground">DigiLocker connected — Aadhaar XXXX-4532</p>
            </div>
          </div>
        </div>

        {/* Recent Cases */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Recent Cases</h2>
            <button
              onClick={() => navigate("/cases")}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentCases.map((c) => (
              <div
                key={c.id}
                className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:shadow-sm transition-shadow cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{c.id}</span>
                    {statusBadge(c.status)}
                  </div>
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">Sections: {c.sections}</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{c.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
