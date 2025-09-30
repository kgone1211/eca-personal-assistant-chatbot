"use client";

import { useEffect, useState, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function BotChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const licenseKeyRef = { current: null as string | null };

  function licenseKey() {
    if (!licenseKeyRef.current) {
      const stored = localStorage.getItem("x_license_key");
      if (stored) {
        licenseKeyRef.current = stored;
      } else {
        // No license key, redirect to main experience page
        window.location.href = "/experiences/main";
        return "";
      }
    }
    return licenseKeyRef.current!;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch("/api/bot/chat/history", {
        headers: { "X-License-Key": licenseKey() }
      });
      
      if (response.ok) {
        const result = await response.json();
        // Convert database messages to frontend format
        const historyMessages: Message[] = result.conversations
          .flatMap((conv: any) => conv.messages)
          .map((msg: any) => ({
            id: msg.id.toString(),
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: new Date(msg.createdAt)
          }));
        
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  const clearChatHistory = async () => {
    if (!confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/bot/chat/history", {
        method: "DELETE",
        headers: { "X-License-Key": licenseKey() }
      });
      
      if (response.ok) {
        setMessages([]);
        alert("Chat history cleared successfully!");
      } else {
        alert("Failed to clear chat history. Please try again.");
      }
    } catch (error) {
      console.error("Failed to clear chat history:", error);
      alert("Failed to clear chat history. Please try again.");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("message", userMessage.content);
      formData.append("coach_name", "Coach");

      const response = await fetch("/api/bot/chat", {
        method: "POST",
        headers: { "X-License-Key": licenseKey() },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Chat API error:", response.status, errorText);
        throw new Error(`Failed to get response from AI: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.reply || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="wrap">
      <div className="chat-container">
        <div className="chat-header">
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
              AI Assistant Chat
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--muted)" }}>
              Trained with your coaching voice and ECA methodology
            </p>
          </div>
          {messages.length > 0 && (
            <button 
              className="btn" 
              onClick={clearChatHistory}
              style={{ 
                fontSize: "12px", 
                padding: "6px 12px",
                backgroundColor: "var(--error)",
                color: "white",
                border: "none",
                borderRadius: "6px"
              }}
            >
              Clear History
            </button>
          )}
        </div>

        <div className="chat-messages">
          {loadingHistory ? (
            <div className="empty-state">
              <h3>Loading your chat history...</h3>
              <p>Retrieving your previous conversations with your AI assistant.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <h3>Welcome to your AI Assistant!</h3>
              <p>
                I'm trained with your coaching voice and ECA methodology. 
                Ask me about protocols, client scenarios, or coaching strategies.
              </p>
            </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === "user" ? "👤" : "🤖"}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    {message.content.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="message-bubble">
                  <div className="loading">
                    <span>Thinking</span>
                    <div className="loading-dots">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <form className="input-form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <textarea
              ref={textareaRef}
              className="input-field"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask your AI assistant anything... (Shift+Enter for new line)"
              disabled={loading}
              rows={1}
            />
            <button
              type="submit"
              className="send-btn"
              disabled={!input.trim() || loading}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
