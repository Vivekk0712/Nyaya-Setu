import { useState, useEffect, useRef } from "react";
import { Mic, Send, Bot, User, Trash2 } from "lucide-react";
import { Button } from "./ui/Button";
import api from "../services/api";

const initialMessages = [
  {
    id: 1,
    role: "bot",
    text: "Namaste 🙏 I am your Digital Public Defender. Please describe your legal issue via text or voice.",
  },
];

const ChatPanel = ({ caseId, onCaseCreated, onReadyToDraft }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentCaseId, setCurrentCaseId] = useState(caseId);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when case ID is available
  useEffect(() => {
    const loadHistory = async () => {
      if (currentCaseId && !historyLoaded) {
        try {
          const response = await api.get(`/api/chat/history/${currentCaseId}`);
          if (response.data.messages && response.data.messages.length > 0) {
            const formattedMessages = response.data.messages.map(msg => ({
              id: msg.id,
              role: msg.role,
              text: msg.text,
              relevant_laws: msg.relevant_laws
            }));
            setMessages([...initialMessages, ...formattedMessages]);
          }
          setHistoryLoaded(true);
        } catch (error) {
          console.error("Error loading chat history:", error);
          setHistoryLoaded(true);
        }
      }
    };

    loadHistory();
  }, [currentCaseId, historyLoaded]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/api/chat", {
        message: input,
        case_id: currentCaseId,
        language: "en"
      });

      const botMessage = {
        id: Date.now() + 1,
        role: "bot",
        text: response.data.message,
        relevant_laws: response.data.relevant_laws,
        citations: response.data.citations || [],
      };

      setMessages((prev) => [...prev, botMessage]);

      // If a new case was created
      if (response.data.case_id && !currentCaseId) {
        setCurrentCaseId(response.data.case_id);
        if (onCaseCreated) {
          onCaseCreated(response.data.case_id);
        }
      }

      // If ready to draft
      if (response.data.ready_to_draft && onReadyToDraft) {
        onReadyToDraft(currentCaseId || response.data.case_id);
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "bot",
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    if (!currentCaseId) return;
    
    if (!window.confirm("Are you sure you want to delete this conversation? This cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/api/chat/history/${currentCaseId}`);
      setMessages(initialMessages);
      setHistoryLoaded(false);
    } catch (error) {
      console.error("Error clearing chat history:", error);
      alert("Failed to clear chat history. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI Legal Interpreter</h2>
            <p className="text-xs text-muted-foreground">Powered by Nyaya-Setu Agent</p>
            {currentCaseId && (
              <p className="text-xs text-primary mt-1">Case ID: {currentCaseId}</p>
            )}
          </div>
          {currentCaseId && messages.length > 1 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearHistory}
              className="gap-1.5 text-destructive hover:text-destructive"
              title="Delete conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
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
              {/* Citations — prefer rich citations, fall back to plain relevant_laws */}
              {(msg.citations?.length > 0 || (msg.relevant_laws && msg.relevant_laws.length > 0)) && (
                <div className="mt-2 pt-2 border-t border-border/30">
                  <p className="text-xs font-semibold mb-1.5 text-muted-foreground">Referenced Sections:</p>
                  <div className="flex flex-col gap-1.5">
                    {(msg.citations?.length > 0 ? msg.citations : msg.relevant_laws.map(l => ({ section: l, source: null }))).map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-1.5 text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg"
                      >
                        <span className="mt-0.5">📌</span>
                        <div>
                          <span className="font-semibold">{c.section || c}</span>
                          {c.source && (
                            <span className="block text-[10px] text-muted-foreground italic mt-0.5">
                              {c.source}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 bg-secondary rounded-xl p-1.5">
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full flex-shrink-0 h-10 w-10 text-primary"
            title="Voice input (coming soon)"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your legal issue..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-2 min-w-0"
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            className="rounded-full flex-shrink-0 h-10 w-10"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
