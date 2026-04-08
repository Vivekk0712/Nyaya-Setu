import { useState } from "react";
import { Mic, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "bot",
    text: "Namaste 🙏 I am your Digital Public Defender. Please describe your legal issue via text or voice.",
  },
  {
    id: 2,
    role: "user",
    text: "My landlord locked my shop without notice and kept my ₹50,000 deposit.",
  },
  {
    id: 3,
    role: "bot",
    text: 'I understand. This appears to be a violation of the Bharatiya Nyaya Sanhita (BNS) for Wrongful Restraint (Section 126(2)) and Breach of Trust (Section 316).\n\nI can draft a formal police complaint for you. Should I proceed?',
  },
];

const ChatPanel = () => {
  const [messages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">AI Legal Interpreter</h2>
        <p className="text-xs text-muted-foreground">Powered by Nyaya-Setu Agent</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                msg.role === "bot" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {msg.role === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-chat-user text-chat-user-foreground rounded-tr-md"
                  : "bg-chat-bot text-chat-bot-foreground rounded-tl-md"
              }`}
            >
              {msg.text.split("\n").map((line, i) => (
                <p key={i} className={i > 0 ? "mt-2" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 bg-secondary rounded-xl p-1.5">
          <Button size="icon" variant="ghost" className="rounded-full flex-shrink-0 h-10 w-10 text-primary">
            <Mic className="h-5 w-5" />
          </Button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your legal issue..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-2 min-w-0"
          />
          <Button size="icon" className="rounded-full flex-shrink-0 h-10 w-10">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
