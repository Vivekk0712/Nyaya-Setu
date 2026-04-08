import { useState, useEffect } from "react";
import { Download, PenLine, FileText, Loader2, Sparkles, CheckCircle, Maximize2, X, Printer, Edit3, Save, Mail } from "lucide-react";
import { Button } from "./ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

const DocumentPanel = ({ caseId, readyToDraft }) => {
  const { user } = useAuth();
  const [draftContent, setDraftContent] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [loadingCase, setLoadingCase] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  // Load existing draft if any
  useEffect(() => {
    const loadCase = async () => {
      if (!caseId) return;
      try {
        setLoadingCase(true);
        const data = await api.getCase(caseId);
        if (data && data.draft_content) {
          setDraftContent(data.draft_content);
        }
      } catch (err) {
        console.error("Failed to load case draft:", err);
      } finally {
        setLoadingCase(false);
      }
    };
    loadCase();
  }, [caseId]);

  const handleGenerateDraft = async () => {
    if (!caseId) return;
    try {
      setIsDrafting(true);
      // Trigger the backend DrafterAgent
      const response = await api.generateDraft(caseId, {
        name: user?.full_name || user?.name,
        email: user?.email
      });
      if (response && response.draft_text) {
        setDraftContent(response.draft_text);
      }
    } catch (err) {
      console.error("Error generating draft:", err);
      alert("Failed to generate draft. Please try again.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleDownload = () => {
    if (!draftContent) return;
    const blob = new Blob([draftContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FIR_Draft_${caseId.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const formattedHtml = draftContent.split('\n').map(line => {
      if (!line.trim()) return '<br/>';
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const lineHtml = parts.map((part, j) => j % 2 === 1 ? `<strong>${part}</strong>` : part).join('');
      return `<p style="margin-bottom: 8px; margin-top: 0;">${lineHtml}</p>`;
    }).join('');

    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    windowPrint.document.write(`
      <html>
        <head>
          <title>Nyaya-Setu - FIR Draft</title>
          <style>
            @page { margin: 20mm; }
            body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; color: black; max-width: 800px; margin: 0 auto; padding: 20px; }
            strong { font-weight: bold; }
          </style>
        </head>
        <body>
          ${formattedHtml}
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 250);
  };

  const handleSaveDraft = async () => {
    if (!caseId) return;
    try {
      setIsSaving(true);
      await api.updateDraft(caseId, draftContent);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save draft:", err);
      alert("Failed to save your edits. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailOfficer = async () => {
    if (!caseId) return;
    try {
      setIsEmailing(true);
      // Send directly to the registered user's email acting as the officer for testing
      const targetEmail = user?.email || "officer@police.gov.in";
      await api.emailDraft(caseId, targetEmail);
      alert(`Email dispatched successfully to ${targetEmail}! Check backend console if SMTP is unconfigured.`);
    } catch (err) {
      console.error("Failed to email draft:", err);
      alert("Failed to email draft. Please check console.");
    } finally {
      setIsEmailing(false);
    }
  };

  if (!caseId) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-6 text-center">
        <FileText className="h-12 w-12 mb-4 text-border" />
        <p className="text-sm">Start a conversation with the Legal Interpreter to generate a draft FIR.</p>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col bg-background overflow-hidden ${isFullscreen ? 'z-[9999]' : 'relative h-full'}`}
      style={isFullscreen ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', margin: 0, padding: 0 } : {}}
    >
      <div className="px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm z-10 flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Document Workspace</h2>
          <p className="text-xs text-muted-foreground">Auto-generated FIR Draft</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {draftContent && !isEditing && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success mr-2">
              <CheckCircle className="h-3 w-3" /> Ready
            </span>
          )}
          
          {draftContent && (
             <>
               {isEditing ? (
                 <Button size="sm" onClick={handleSaveDraft} disabled={isSaving} className="gap-2 h-8 px-3">
                   {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                   <span className="hidden sm:inline">Save Edits</span>
                 </Button>
               ) : (
                 <>
                   <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="gap-2 h-8 px-3 bg-card border-border hover:bg-secondary">
                     <Edit3 className="h-3.5 w-3.5" />
                     <span className="hidden sm:inline">Edit</span>
                   </Button>
                   <Button size="sm" variant="outline" onClick={handlePrint} className="gap-2 h-8 px-3 bg-card border-border hover:bg-secondary hidden sm:flex">
                     <Printer className="h-3.5 w-3.5" />
                     Print
                   </Button>
                 </>
               )}
               
               <div className="h-4 w-px bg-border mx-1 hidden sm:block"></div>
               
               <button 
                 onClick={() => setIsFullscreen(!isFullscreen)}
                 className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors flex-shrink-0"
                 title={isFullscreen ? "Close Fullscreen" : "Fullscreen View"}
               >
                 {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
               </button>
             </>
          )}
        </div>
      </div>

      {loadingCase ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : draftContent ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-secondary/30 print:p-0 print:bg-white relative">
            <div className="bg-card rounded-xl border border-border shadow-sm p-6 md:p-10 max-w-2xl mx-auto font-serif text-[15px] leading-relaxed text-foreground print:border-none print:shadow-none print:max-w-none print:p-0 print:m-0">
              {isEditing ? (
                <textarea
                  className="w-full min-h-[60vh] bg-transparent border-none outline-none font-serif text-[15px] leading-relaxed resize-y text-foreground focus:ring-0 p-0"
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                />
              ) : (
                draftContent.split('\n').map((line, i) => {
                  if (!line.trim()) return <div key={i} className="h-4" />;
                  const parts = line.split(/\*\*(.*?)\*\*/g);
                  return (
                    <p key={i} className="mb-2">
                      {parts.map((part, j) => 
                        j % 2 === 1 ? <strong key={j} className="font-bold">{part}</strong> : part
                      )}
                    </p>
                  );
                })
              )}
            </div>
          </div>
          <div className="p-3 border-t border-border flex gap-2 bg-card print:hidden">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download TXT
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
              onClick={handleEmailOfficer}
              disabled={isEmailing}
            >
              {isEmailing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Email Officer (PDF)
            </Button>
            <Button className="flex-1 gap-2 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
              <PenLine className="h-4 w-4" />
              e-Sign & File
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-1 items-center justify-center p-6 text-center">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Draft Not Generated</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {!readyToDraft 
              ? "The legal interpreter is still gathering details. Once enough info is collected, you can generate the draft."
              : "All necessary details have been collected. You can now generate the official FIR draft."}
          </p>
          <Button 
            onClick={handleGenerateDraft} 
            disabled={isDrafting || (!readyToDraft && !draftContent)}
            className="gap-2 shadow-md shadow-primary/20 transition-all font-medium"
            size="lg"
          >
            {isDrafting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Drafting FIR...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate FIR Draft
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentPanel;
