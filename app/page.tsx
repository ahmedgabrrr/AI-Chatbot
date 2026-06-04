"use client";
import avatar from "@/public/avat.png"
import Image from "next/image";
import { useState } from "react";
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
      <Image className="h-40 w-80" src={avatar} alt="avatar" />


      <div className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-lg border p-4 ">
        {messages.length === 0 && (
          <p className="text-gray-500">
            GaBooRa is an AI chatbot , Ask me anything...
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[80%] rounded-xl p-3 ${message.role === "user"
              ? "ml-auto bg-sky-800 -500 text-white"
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
      </div>

      <div className="flex gap-2">
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

        <div className="bg-sky-800 text-white rounded-lg border px-5 py-3" onClick={sendMessage}>
          <FontAwesomeIcon
       
            icon={faPaperPlane} />
          </div>

      </div>
    </main>
  );
}
