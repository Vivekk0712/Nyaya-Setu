import { useState, useEffect } from "react";
import {
  FileText,
  Scale,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { useTranslation } from "react-i18next";

const statusBadge = (status) => {
  if (status === "intake" || status === "drafted")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-700 shadow-sm">
        <Clock className="h-3 w-3 animate-pulse" /> Active
      </span>
    );
  if (status === "filed" || status === "resolved")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-success/10 text-success shadow-sm">
        <CheckCircle2 className="h-3 w-3" /> Filed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-border text-muted-foreground shadow-sm">
      <AlertTriangle className="h-3 w-3" /> Unknown
    </span>
  );
};

const DashboardNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await api.getCases();
        setCases(data.cases || []);
      } catch (error) {
        console.error("Error loading cases:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status === "intake" || c.status === "drafted").length;
  const resolvedCases = cases.filter((c) => c.status === "filed" || c.status === "resolved").length;
  const nudgesSent = 0; // Mock stat for now since nudge features are upcoming

  const stats = [
    { label: t("Total Cases"), value: totalCases, icon: FileText, color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
    { label: t("Active"), value: activeCases, icon: Clock, color: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
    { label: t("Filed"), value: resolvedCases, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
    { label: t("Nudges Sent"), value: nudgesSent, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50 border-purple-200" },
  ];

  const recentCases = cases
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Dynamic Gradient Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary to-slate-800 p-8 md:p-10 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                {t("Welcome back")}, {user?.name || user?.full_name || "User"}
              </h1>
              <p className="text-slate-300 text-sm md:text-base max-w-lg font-medium">
                {t("Your AI Legal Assistant has synced your cases. You have")} <strong className="text-white">{activeCases} {t("active")}</strong> {t("drafts awaiting action.")}
              </p>
            </div>
            <Button size="lg" onClick={() => navigate("/new-case")} className="gap-2 shrink-0 bg-white text-slate-900 hover:bg-slate-100 shadow-xl transition-transform hover:scale-105">
              <Scale className="h-5 w-5" />
              {t("File New Case")}
            </Button>
          </div>
        </div>

        {/* Floating Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s, idx) => (
            <div
              key={s.label}
              className={`relative overflow-hidden group bg-white border ${s.bg} rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <s.icon className={`w-32 h-32 ${s.color}`} />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-2xl bg-white shadow-sm ring-1 ring-black/5`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
              </div>
              <p className="text-4xl font-extrabold text-slate-900 mb-1 relative z-10 tracking-tight">{loading ? "-" : s.value}</p>
              <p className="text-sm font-semibold text-slate-500 relative z-10 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
             <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Empty State */}
            {cases.length === 0 && (
              <div className="bg-white border border-border rounded-3xl p-12 text-center shadow-sm">
                <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Scale className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{t("Get Started with Nyaya-Setu")}</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                  {t("Your AI-powered legal assistant is fully configured and ready to help you magically draft a professional FIR.")}
                </p>
                <Button size="lg" onClick={() => navigate("/new-case")} className="gap-2 shadow-lg hover:shadow-primary/25">
                  <ArrowRight className="h-5 w-5" />
                  {t("Start Initial Assessment")}
                </Button>
              </div>
            )}

            {/* Premium Recent Cases List */}
            {cases.length > 0 && (
              <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between bg-slate-50/50">
                  <h2 className="text-xl font-bold text-slate-900">{t("Recent Filings")}</h2>
                  <button
                    onClick={() => navigate("/cases")}
                    className="text-sm text-primary font-bold flex items-center gap-1 hover:underline transition-all hover:gap-2"
                  >
                    {t("View All Vault")} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {recentCases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/new-case?caseId=${c.id}`)}
                      className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">ID: {c.id.split('-')[0]}</span>
                          {statusBadge(c.status)}
                        </div>
                        <p className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                          {c.incident_description?.substring(0, 80) || "No description provided"}...
                        </p>
                        <p className="text-sm font-medium text-slate-500">
                           {t("Identified Sections")}: {c.legal_sections && c.legal_sections.length > 0 ? (
                            <span className="text-slate-700 font-semibold">{c.legal_sections.join(', ')}</span>
                          ) : (
                            <span className="italic">{t("Scanning in progress")}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2">
                         <p className="text-sm font-bold text-slate-400">
                           {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                         </p>
                         <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                           <ArrowRight className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardNew;
