import React, { useState, useEffect, useRef } from "react";
import "./chatbot.css";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage = { sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:10000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();
      const botText = data && data.response ? data.response : "He thong tam thoi ban, vui long thu lai";
      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "He thong tam thoi ban, vui long thu lai" }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) sendMessage();
    }
  };

  return (
    <div className="chatbot">
      <div className="chat-header">Hỗ trợ</div>

      <div className="messages" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.sender}`}>
            <div className="bubble">{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="input-area">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Nhập tin nhắn..."
          rows={2}
        />
        <button className="send-btn" onClick={sendMessage} disabled={loading}>
          {loading ? "Dang tra loi..." : "Gửi"}
        </button>
      </div>
    </div>
  );
}
