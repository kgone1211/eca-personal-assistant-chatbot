import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { authUser } from "../../_utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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

  // TEMPORARY WORKAROUND: Skip Whisper API due to consistent timeouts
  // Return a helpful message that guides users to manual input
  console.log("Audio recorded successfully, but skipping Whisper API due to timeout issues");
  return NextResponse.json({ 
    text: "[Audio recorded successfully! Please use the '✍️ Manual input' button to type your answer, or try the microphone again later when the transcription service is more stable.]",
    error: "Transcription service temporarily disabled due to API timeouts"
  });
}
