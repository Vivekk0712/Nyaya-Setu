import { Download, PenLine } from "lucide-react";
import { Button } from "./ui/Button";
import { useAuth } from "../contexts/AuthContext";

const DocumentPanel = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Document Workspace</h2>
        <p className="text-xs text-muted-foreground">Auto-generated FIR Draft</p>
      </div>

      {/* Document Preview */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-card rounded-xl border border-border shadow-md p-6 md:p-8 max-w-2xl mx-auto font-serif">
          <div className="text-center mb-6 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">First Information Report</p>
            <div className="h-px bg-border my-3" />
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-foreground">
            <p>
              <span className="font-semibold">To,</span>
              <br />
              The Station House Officer (SHO)
              <br />
              [Police Station Name], [City]
            </p>

            <p>
              <span className="font-semibold">Subject:</span> FIR for [Legal Issue] under BNS Sections [Section Numbers].
            </p>

            <p>
              <span className="font-semibold">Respected Sir/Madam,</span>
            </p>

            <p>
              I, <span className="font-semibold">{user?.name || "[Your Name]"}</span>, S/o [Father's Name], resident of
              [Your Address], Aadhaar No. XXXX-XXXX-XXXX,
              hereby lodge this complaint against <span className="font-semibold">[Accused Name]</span>,
              [Accused Details].
            </p>

            <p>
              [Description of the incident with dates, locations, and relevant legal sections will be auto-generated based on your conversation with the AI assistant.]
            </p>

            <p>
              I respectfully request the authorities to register this FIR and take appropriate
              legal action against the accused.
            </p>

            <div className="mt-6 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span>Place: [City, State]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-3 border-t border-border flex gap-2">
        <Button variant="outline" className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button className="flex-1 gap-2">
          <PenLine className="h-4 w-4" />
          e-Sign & File
        </Button>
      </div>
    </div>
  );
};

export default DocumentPanel;
