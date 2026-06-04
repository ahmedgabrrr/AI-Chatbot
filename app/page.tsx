"use client";
import avatar from "@/public/avat.png"
import Image from "next/image";
import { useState,useEffect,useRef } from "react";
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
      behavior: "smooth",
    });
  }, [messages]);


  const sendMessage = async () => {
    alert("clicked")
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
      })
      const data = await res.json();
      const aiMessage: Message = {
        role: "assistant",
        content: data.text,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }


  }
  return (
    <main className="mx-auto flex h-screen max-w-4xl flex-col p-4">
      {/* <Image className="h-40 w-80" src={avatar} alt="avatar" /> */}


      <div className="h-[75vh] overflow-y-auto rounded-lg border p-4 ">
        {messages.length === 0 && (
          <p className="text-gray-500">
            GaBooRa is an AI chatbot , Ask me anything...
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] md:max-w-[70%] rounded-xl p-3 ${message.role === "user"
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
      <button
        onClick={sendMessage}
        disabled={loading}
        className="-z-50 rounded-lg bg-sky-800 px-4 py-3 text-white disabled:opacity-50"
      >
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
      <div className="z-50 sticky bottom-0 flex gap-2 border-t bg-white p-2">
        <input
          type="text"
          value={input}
          placeholder="Ask anything..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          className="flex-1 rounded-lg border p-3"
        />

        

      </div>
    </main>
  );
}
