
import { GoogleGenAI } from "@google/genai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("خطأ: لم يتم العثور على GEMINI_API_KEY في ملف الـ .env");
      return Response.json({ error: "Gemini API key is completely missing from environment variables." }, { status: 500 });
    }


    const ai = new GoogleGenAI({ apiKey });
    const { messages } = await req.json();


    const cleanMessages = messages.filter(
      (msg: any) => msg.content && msg.content.trim() !== ""
    );

    if (cleanMessages.length === 0) {
      return Response.json({ error: "No valid messages to send." }, { status: 400 });
    }


    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: cleanMessages.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    });

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (streamErr) {
          console.error("Error during streaming chunks:", streamErr);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });

  } catch (error: any) {
    console.error("Gemini Route Exception:", error);
    return Response.json({ error: error?.message || "Internal server error during chat initialization" }, { status: 500 });
  }
}