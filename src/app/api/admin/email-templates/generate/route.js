import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "college-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    let geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured in .env" },
        { status: 500 },
      );
    }
    geminiKey = geminiKey
      .trim()
      .replace(/^["']|["']$/g, "")
      .trim();

    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let lastError = null;
    let text = null;

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;

        const generationConfig = {};
        if (modelName.includes("1.5") || modelName.includes("2.0")) {
          generationConfig.responseMimeType = "application/json";
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an AI assistant designed to generate professional university email templates.
Your output must be a clean, valid JSON object with EXACTLY two properties: "subject" and "body".
Do not wrap your output in markdown code blocks (like \`\`\`json) or include any extra conversational text. Return ONLY the JSON object.

Format constraints:
- In the generated subject and body, insert placeholders wrapped in angle brackets (like <Student Name>, <Date>, <Batch>, <Department>, <Deadline>, <Organizer>) in any area containing dynamic context or values.

Generate a template for the following topic:
"${prompt}"`,
                  },
                ],
              },
            ],
            generationConfig,
          }),
        });

        const responseData = await response.json();
        if (response.ok) {
          text = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            break; // Success!
          }
        } else {
          lastError = new Error(
            responseData.error?.message || `Failed on model ${modelName}`,
          );
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!text) {
      throw (
        lastError ||
        new Error("All tried Gemini models failed to return content.")
      );
    }

    let cleanJson = text.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(json)?/, "");
      cleanJson = cleanJson.replace(/```$/, "");
      cleanJson = cleanJson.trim();
    }

    const parsed = JSON.parse(cleanJson);
    return NextResponse.json({
      success: true,
      subject: parsed.subject,
      body: parsed.body,
    });
  } catch (error) {
    console.error("Gemini template generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate template" },
      { status: 500 },
    );
  }
}
