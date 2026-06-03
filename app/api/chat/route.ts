// import { ai } from "@/lib/gemini";

// export async function POST(req: Request) {
//   const { message } = await req.json();

//   const response = await ai.models.generateContent({
//     model: "gemini-3.5-flash",
//     contents: message,
//   });

//   return Response.json({
//     text: response.text,
//   });
// }
// app/api/chat/route.ts

import { ai } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: messages.map(
        (message: { role: "user" | "assistant"; content: string }) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [
            {
              text: message.content || "",
            },
          ],
        }),
      ),
    });

    return Response.json({
      text: response.text,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Failed to generate response",
      },
      {
        status: 500,
      },
    );
  }
}
