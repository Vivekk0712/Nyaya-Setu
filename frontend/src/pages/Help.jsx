import { useState } from "react";
import { HelpCircle, ChevronDown, BookOpen, Scale, Phone, ExternalLink } from "lucide-react";

const faqs = [
  {
    q: "What is the Bharatiya Nyaya Sanhita (BNS)?",
    a: "The BNS is the new criminal code of India that replaced the Indian Penal Code (IPC) in 2024. It modernizes and consolidates criminal law provisions. Nyaya-Setu automatically maps your case to the relevant BNS sections.",
  },
  {
    q: "How do I file an FIR online?",
    a: "Nyaya-Setu drafts a formal FIR document for you based on your complaint. You can then download the PDF, e-sign it, and submit it to your local police station or through the E-Courts portal. In many states, e-FIR filing is available online.",
  },
  {
    q: "What is DigiLocker and why should I connect it?",
    a: "DigiLocker is a government platform for digital document storage. By connecting it, Nyaya-Setu can automatically fetch your verified identity (Aadhaar, PAN) to populate legal documents — saving you time and ensuring accuracy.",
  },
  {
    q: "What happens after I file a complaint?",
    a: "Our Advisory Agent monitors your case. If authorities don't respond within 7 days, the system automatically drafts and sends a follow-up nudge to higher officials, citing your complaint number and the legal mandate for timely response.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All data is encrypted in transit and at rest. Your personal information is only used to generate legal documents and is never shared with third parties. You can delete your data at any time from Settings.",
  },
  {
    q: "Can I use Nyaya-Setu for consumer complaints?",
    a: "Absolutely. Nyaya-Setu supports complaints under the Consumer Protection Act, 2019. Simply describe your consumer issue and the AI will identify the relevant sections and draft a formal complaint.",
  },
];

const resources = [
  { title: "Know Your Rights — Tenant Law", icon: BookOpen },
  { title: "Consumer Complaint Guide", icon: Scale },
  { title: "Emergency Legal Helpline: 15100", icon: Phone },
];

const Help = () => {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Help & Legal FAQ</h1>
          <p className="text-sm text-muted-foreground">Common questions about your rights and how Nyaya-Setu works</p>
        </div>

        {/* Quick Resources */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {resources.map((r) => (
            <div
              key={r.title}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow cursor-pointer"
            >
              <r.icon className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">{r.title}</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
            </div>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground flex-1">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pl-11 animate-fade-in">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
          <p className="text-sm font-medium text-foreground mb-1">Still need help?</p>
          <p className="text-xs text-muted-foreground mb-3">
            Our team is available Mon–Sat, 9 AM – 6 PM IST
          </p>
          <a
            href="mailto:support@nyaya-setu.in"
            className="text-sm font-medium text-primary hover:underline"
          >
            support@nyaya-setu.in
          </a>
        </div>
      </div>
    </div>
  );
};

export default Help;
