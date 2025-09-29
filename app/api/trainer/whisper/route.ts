import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { authUser } from "../../_utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { user } = await authUser(req);
    if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status:400 });

    // Check file size and type
    const fileSize = file.size;
    const fileType = file.type;
    console.log(`Processing audio file: ${file.name}, size: ${fileSize} bytes, type: ${fileType}`);
    
    if (fileSize === 0) {
      return NextResponse.json({ 
        error: "Empty audio file", 
        text: "[Empty audio file - please record something]"
      }, { status: 400 });
    }

    // Check if file is too large (Whisper has a 25MB limit)
    if (fileSize > 25 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "File too large", 
        text: "[Audio file too large - please record a shorter message]"
      }, { status: 400 });
    }

    console.log("Sending to OpenAI Whisper API...");
    
    // Convert File to Buffer for Whisper API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a new File object with proper name and type
    const audioFile = new File([buffer], "recording.webm", { type: "audio/webm" });
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      response_format: "text"
    });

    console.log("Whisper API response received");
    const text = (transcription as unknown as string) || "";
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ 
        error: "No transcription result", 
        text: "[No speech detected - please try speaking louder or closer to the microphone]"
      }, { status: 400 });
    }

    console.log("Transcription successful:", text.substring(0, 100) + "...");
    return NextResponse.json({ text });

  } catch (error) {
    console.error("Whisper API error:", error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json({ 
          error: "API key issue", 
          text: "[Transcription failed - API key issue. Please use manual input.]"
        }, { status: 401 });
      }
      if (error.message.includes("timeout") || error.message.includes("ECONNRESET")) {
        return NextResponse.json({ 
          error: "Transcription timeout", 
          text: "[Transcription timeout - please try again or use manual input]"
        }, { status: 408 });
      }
    }
    
    return NextResponse.json({ 
      error: "Transcription failed", 
      text: "[Transcription failed - please use the '✍️ Manual input' button to type your answer]"
    }, { status: 500 });
  }
}
