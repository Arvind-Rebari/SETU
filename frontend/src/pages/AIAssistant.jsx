
import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  ClipboardCheck,
  Stethoscope,
  UserRound,
  Plus,
  ShieldCheck
} from "lucide-react";
import "./AIAssistant.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const suggestions = [
  {
    icon: FileText,
    title: "Summarize Referral",
    description: "Create a simple referral summary.",
    prompt: "Help me summarize a referral."
  },
  {
    icon: ClipboardCheck,
    title: "Check Missing Information",
    description: "Review a referral checklist.",
    prompt: "Show me a checklist of information required in a referral."
  },
  {
    icon: Stethoscope,
    title: "Prepare Doctor Review",
    description: "Organize information for doctor review.",
    prompt: "What information should be prepared for a doctor's review?"
  }
];

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm SETU Assistant. I can help organize referral information and prepare administrative summaries. How can I help you today?"
    }
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (customMessage) => {
    const question = (customMessage ?? input).trim();

    if (!question || isLoading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text: question }
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: question
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "SETU could not get an AI response."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.reply || "No response received from SETU AI."
        }
      ]);
    } catch (error) {
      console.error("SETU AI Frontend Error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: error.message === "Failed to fetch"
            ? "Unable to connect to SETU's backend. Please check that your backend server is running on port 5000."
            : error.message || "Something went wrong. Please try again.",
          error: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    if (isLoading) return;

    setMessages([
      {
        role: "assistant",
        text: "New conversation started! How can I help you?"
      }
    ]);

    setInput("");
  };

  return (
    <div className="ai-page">
      <div className="ai-header">
        <div className="ai-heading">
          <div className="ai-heading-icon">
            <Bot size={25} />
          </div>

          <div>
            <h1>SETU AI Assistant</h1>
            <p>Smart assistance for clinic coordination</p>
          </div>
        </div>

        <button
          className="ai-new-chat"
          onClick={startNewChat}
          disabled={isLoading}
        >
          <Plus size={17} />
          New Chat
        </button>
      </div>

      <div className="ai-notice">
        <ShieldCheck size={19} />
        <span>
          AI assists. Human verifies. Doctor decides.
        </span>
      </div>

      <div className="ai-chat-container">
        <div className="ai-chat-content">
          {messages.length === 1 && (
            <div className="ai-welcome">
              <div className="ai-welcome-icon">
                <Sparkles size={30} />
              </div>

              <h2>How can I help your clinic today?</h2>

              <p>
                Choose an action below or type a message to explore
                the SETU Assistant.
              </p>

              <div className="ai-suggestions">
                {suggestions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      className="ai-suggestion-card"
                      key={item.title}
                      onClick={() => sendMessage(item.prompt)}
                      disabled={isLoading}
                    >
                      <Icon size={22} />
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="ai-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`ai-message ${
                  message.role === "user" ? "user-message" : "bot-message"
                } ${message.error ? "ai-error-message" : ""}`}
              >
                <div className="ai-message-avatar">
                  {message.role === "user" ? (
                    <UserRound size={18} />
                  ) : (
                    <Bot size={19} />
                  )}
                </div>

                <div className="ai-message-content">
                  <strong>
                    {message.role === "user" ? "You" : "SETU Assistant"}
                  </strong>

                  <p>{message.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="ai-message bot-message">
                <div className="ai-message-avatar">
                  <Bot size={19} />
                </div>

                <div className="ai-message-content ai-typing">
                  <strong>SETU Assistant</strong>
                  <p>
                    Thinking
                    <span className="ai-dots">...</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <form
          className="ai-input-area"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            placeholder="Ask SETU Assistant something..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <Send size={19} />
          </button>
        </form>

        <p className="ai-disclaimer">
          Powered by Groq AI. Responses are AI-generated and may contain
          errors. Use fictional test information only. Never enter
          identifiable or confidential patient information.
          A qualified doctor must verify all clinical information.
        </p>
      </div>
    </div>
  );
}

export default AIAssistant;
