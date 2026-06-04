"use client";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
    });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = {
      role: "user",
      content: input,
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        })
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.text || data.reply || data.response || (data.choices && data.choices[0]?.message?.content) || "No response text";

      const aiMessage: Message = {
        role: "assistant",
        content: replyText,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : "Connection failed"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex h-[dvh] max-w-4xl flex-col p-4 justify-between">


      <div className="flex-1 overflow-y-auto rounded-lg border p-4 space-y-3 mb-2">
        {messages.length === 0 && (
          <p className="text-gray-500">
            GaBooRa is an AI chatbot , Ask me anything...
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] md:max-w-[70%] rounded-xl p-3 ${
              message.role === "user"
                ? "ml-auto bg-sky-800 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {message.content}
          </div>
        ))}

        {loading && (
          <div className="max-w-[80%] rounded-xl bg-gray-200 p-3">
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 z-50 flex gap-2 border-t bg-white p-2 w-full">
        <input
          type="text"
          value={input}
          placeholder="Ask anything..."
          onChange={(e) => setInput(e.target.value)}
          
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); 
              sendMessage();
            }
          }}
          className="flex-1 rounded-lg border p-3 min-w-0"
        />

        <button
          type="button" 
          onClick={sendMessage}
          onTouchEnd={(e) => {
            e.preventDefault(); 
            sendMessage();
          }}
          disabled={loading}
          className="rounded-lg bg-sky-800 px-4 py-3 text-white disabled:opacity-50 shrink-0"
        >
          <FontAwesomeIcon icon={faPaperPlane} className="pointer-events-none" />
        </button>
      </div>
    </main>
  );
}