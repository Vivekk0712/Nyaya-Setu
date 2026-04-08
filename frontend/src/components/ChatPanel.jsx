import { useState } from "react";
import { Mic, Send, Bot, User } from "lucide-react";
import { Button } from "./ui/Button";

const initialMessages = [
  {
    id: 1,
    role: "bot",
    text: "Namaste 🙏 I am your Digital Public Defender. Please describe your legal issue via text or voice.",
  },
];

const ChatPanel = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: Integrate with backend API
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        role: "bot",
        text: "I understand your concern. Let me analyze this legal issue and identify the relevant sections...",
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        {isLoading && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-chat-bot text-chat-bot-foreground rounded-2xl rounded-tl-md px-4 py-2.5 text-sm">
              <div className="flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
              </div>
            </div>
          </div>
        )}
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
            onKeyPress={handleKeyPress}
            placeholder="Describe your legal issue..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-2 min-w-0"
          />
          <Button 
            size="icon" 
            className="rounded-full flex-shrink-0 h-10 w-10"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
