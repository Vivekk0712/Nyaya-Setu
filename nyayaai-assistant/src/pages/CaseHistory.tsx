import { useState } from "react";
import { Search, Filter, FileText, Clock, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const allCases = [
  {
    id: "NYS-2026-003",
    title: "Wrongful Restraint & Breach of Trust",
    status: "active" as const,
    date: "08 Apr 2026",
    sections: "BNS 126(2), 316",
    against: "Mr. Suresh Verma",
    location: "Lucknow, UP",
  },
  {
    id: "NYS-2026-002",
    title: "Consumer Product Defect Complaint",
    status: "resolved" as const,
    date: "22 Mar 2026",
    sections: "CPA Section 2(6)",
    against: "XYZ Electronics Pvt. Ltd.",
    location: "Lucknow, UP",
  },
  {
    id: "NYS-2026-001",
    title: "Noise Pollution Complaint",
    status: "resolved" as const,
    date: "10 Feb 2026",
    sections: "BNS Section 290",
    against: "ABC Construction Co.",
    location: "Kanpur, UP",
  },
];

type StatusFilter = "all" | "active" | "resolved";

const CaseHistory = () => {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = allCases.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Cases</h1>
          <p className="text-sm text-muted-foreground">All your filed complaints and their status</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cases..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "active", "resolved"] as StatusFilter[]).map((f) => (
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

        {/* Case List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No cases found</div>
          )}
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs font-mono text-muted-foreground">{c.id}</span>
                    {c.status === "active" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                        <Clock className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success">
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Against: {c.against}</span>
                    <span>Sections: {c.sections}</span>
                    <span>{c.location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground">{c.date}</span>
                  <Button size="sm" variant="ghost" className="gap-1 text-xs text-primary">
                    View <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseHistory;
