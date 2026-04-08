import { Download, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

const DocumentPanel = () => {
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
              Kotwali Police Station, Lucknow
            </p>

            <p>
              <span className="font-semibold">Subject:</span> FIR for Wrongful Restraint and Breach
              of Trust under BNS Sections 126(2) and 316.
            </p>

            <p>
              <span className="font-semibold">Respected Sir/Madam,</span>
            </p>

            <p>
              I, <span className="font-semibold">Rajesh Kumar</span>, S/o Shri Mohan Lal, resident of
              45, Gandhi Nagar, Lucknow, Uttar Pradesh — 226001, Aadhaar No. XXXX-XXXX-4532,
              hereby lodge this complaint against <span className="font-semibold">Mr. Suresh Verma</span>,
              owner of Shop No. 12, Hazratganj Market, Lucknow.
            </p>

            <p>
              On the date of <span className="font-semibold">15th March 2025</span>, the accused
              unlawfully locked my commercial establishment without prior notice, causing wrongful
              restraint under <span className="underline">BNS Section 126(2)</span>. Additionally,
              the accused has refused to return my security deposit of{" "}
              <span className="font-semibold">₹50,000</span>, constituting criminal breach of trust
              under <span className="underline">BNS Section 316</span>.
            </p>

            <p>
              I respectfully request the authorities to register this FIR and take appropriate
              legal action against the accused.
            </p>

            <div className="mt-6 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>Date: 08 April 2026</span>
              <span>Place: Lucknow, UP</span>
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
