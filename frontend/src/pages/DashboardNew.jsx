import {
  FileText,
  Scale,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

const stats = [
  { label: "Total Cases", value: "0", icon: FileText, color: "text-primary" },
  { label: "Active", value: "0", icon: Clock, color: "text-amber-500" },
  { label: "Resolved", value: "0", icon: CheckCircle2, color: "text-success" },
  { label: "Nudges Sent", value: "0", icon: TrendingUp, color: "text-primary" },
];

const recentCases = [];

const statusBadge = (status) => {
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

const DashboardNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name || "User"}</h1>
            <p className="text-sm text-muted-foreground">Your legal dashboard at a glance</p>
          </div>
          <Button onClick={() => navigate("/new-case")} className="gap-2 w-full sm:w-auto">
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

        {/* Welcome Message */}
        {recentCases.length === 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <Scale className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Get Started with Nyaya-Setu</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your AI-powered legal assistant is ready to help you file complaints and track your cases.
            </p>
            <Button onClick={() => navigate("/new-case")} className="gap-2">
              <Scale className="h-4 w-4" />
              File Your First Case
            </Button>
          </div>
        )}

        {/* Recent Cases */}
        {recentCases.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default DashboardNew;
