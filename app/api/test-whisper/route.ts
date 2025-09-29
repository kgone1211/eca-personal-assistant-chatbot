import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    console.log("Testing Whisper API...");
    
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    console.log(`Test file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a new File object
    const audioFile = new File([buffer], "test.webm", { type: "audio/webm" });
    
    console.log("Calling Whisper API...");
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      response_format: "text"
    });

    console.log("Whisper API response:", transcription);
    const text = (transcription as unknown as string) || "";
    
    return NextResponse.json({ 
      success: true, 
      text,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    });
    
  } catch (error) {
    console.error("Whisper test error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      hasApiKey: !!process.env.OPENAI_API_KEY
    }, { status: 500 });
  }
}
