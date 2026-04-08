import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Filter, FileText, Clock, CheckCircle2,
  ArrowUpRight, Plus, AlertCircle, Loader2, Scale
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { api } from "../services/api";

const STATUS_CONFIG = {
  intake:   { label: "Intake",   color: "bg-blue-100 text-blue-700",   icon: Clock },
  active:   { label: "Active",   color: "bg-amber-100 text-amber-700", icon: Clock },
  drafted:  { label: "Drafted",  color: "bg-purple-100 text-purple-700", icon: FileText },
  filed:    { label: "Filed",    color: "bg-success/10 text-success",   icon: CheckCircle2 },
  resolved: { label: "Resolved", color: "bg-success/10 text-success",   icon: CheckCircle2 },
};

const FILTERS = ["all", "intake", "active", "drafted", "filed", "resolved"];

const CaseHistory = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const data = await api.getCases();
        // Sort newest first
        const sorted = (data.cases || []).sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        setCases(sorted);
      } catch (err) {
        setError("Failed to load cases. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filtered = cases.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const desc = (c.incident_description || "").toLowerCase();
      const id = (c.id || "").toLowerCase();
      if (!desc.includes(q) && !id.includes(q)) return false;
    }
    return true;
  });

  const openCase = (caseId) => {
    navigate(`/new-case?caseId=${caseId}`);
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const truncate = (text, len = 90) => {
    if (!text) return "No description";
    return text.length > len ? text.slice(0, len) + "…" : text;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Cases</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading ? "Loading…" : `${cases.length} case${cases.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <Button
            onClick={() => navigate("/new-case")}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cases by description or ID…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="capitalize text-xs"
              >
                {f === "all" && <Filter className="h-3 w-3 mr-1" />}
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading your cases…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Scale className="h-8 w-8 text-primary" />
              </div>
            </div>
            <p className="text-foreground font-medium">
              {cases.length === 0 ? "No cases yet" : "No cases match your filter"}
            </p>
            <p className="text-xs text-muted-foreground">
              {cases.length === 0
                ? "Start a conversation to automatically create your first case"
                : "Try a different search or filter"}
            </p>
            {cases.length === 0 && (
              <Button size="sm" onClick={() => navigate("/new-case")} className="gap-2 mt-2">
                <Plus className="h-4 w-4" />
                Start New Case
              </Button>
            )}
          </div>
        )}

        {/* Case list */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((c) => {
              const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.active;
              const Icon = statusCfg.icon;
              const sections = Array.isArray(c.legal_sections)
                ? c.legal_sections.filter(Boolean).slice(0, 3)
                : [];

              return (
                <div
                  key={c.id}
                  onClick={() => openCase(c.id)}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">

                      {/* ID + Status */}
                      <div className="flex flex-wrap items-center gap-2">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                          {c.id}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusCfg.color}`}>
                          <Icon className="h-3 w-3" />
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-foreground leading-snug">
                        {truncate(c.incident_description)}
                      </p>

                      {/* Sections + date */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {sections.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {sections.map((s, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-md font-medium">
                                {s}
                              </span>
                            ))}
                            {(c.legal_sections || []).length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-md">
                                +{c.legal_sections.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDate(c.created_at)}
                        </span>
                      </div>

                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 self-center">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default CaseHistory;
