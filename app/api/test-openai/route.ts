import { NextRequest, NextResponse } from "next/server";
import { openai, DEFAULT_MODEL } from "@/lib/openai";

export async function GET(req: NextRequest) {
  try {
    console.log("Testing OpenAI API...");
    console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);
    console.log("Default model:", DEFAULT_MODEL);
    
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "user", content: "Say 'Hello, OpenAI API is working!'" }
      ],
      max_tokens: 50,
      temperature: 0.1
    });
    
    const reply = completion.choices[0].message?.content || "";
    
    return NextResponse.json({ 
      success: true, 
      reply,
      model: DEFAULT_MODEL,
      message: "OpenAI API test successful"
    });
  } catch (error) {
    console.error("OpenAI API test error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      hasApiKey: !!process.env.OPENAI_API_KEY,
      model: DEFAULT_MODEL
    }, { status: 500 });
  }
}
