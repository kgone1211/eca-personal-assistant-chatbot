import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authUser } from "../../_utils";

export async function GET(req: NextRequest) {
  try {
    const { user } = await authUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch all training blobs (Q&A sessions) for this user, grouped by voice version
    const trainingBlobs = await prisma.trainingBlob.findMany({
      where: { 
        userId: user.id,
        kind: "qa" // Only Q&A training sessions, not otter uploads
      },
      orderBy: { voiceVersion: "desc" }, // Most recent first
      select: {
        id: true,
        voiceVersion: true,
        createdAt: true,
        content: true
      }
    });

    // Get summary statistics for each version
    const sessions = trainingBlobs.map(blob => {
      // Count how many questions were answered in this session
      const questionCount = (blob.content.match(/Q\d+:/g) || []).length;
      
      // Extract a preview of the first answer
      const firstAnswerMatch = blob.content.match(/A\d+:\s*(.{0,200})/);
      const preview = firstAnswerMatch ? firstAnswerMatch[1].trim() + "..." : "";
      
      return {
        id: blob.id,
        version: blob.voiceVersion,
        createdAt: blob.createdAt,
        questionCount,
        preview,
        totalCharacters: blob.content.length
      };
    });

    // Get Otter uploads separately
    const otterUploads = await prisma.trainingBlob.findMany({
      where: {
        userId: user.id,
        kind: "otter"
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        content: true,
        voiceVersion: true
      },
      take: 10 // Last 10 otter uploads
    });

    const otterSessions = otterUploads.map(upload => ({
      id: upload.id,
      createdAt: upload.createdAt,
      characterCount: upload.content.length,
      preview: upload.content.substring(0, 200) + "...",
      voiceVersion: upload.voiceVersion
    }));

    return NextResponse.json({
      trainingSessions: sessions,
      otterUploads: otterSessions,
      totalVersions: sessions.length,
      currentVersion: sessions.length > 0 ? sessions[0].version : 0,
      lastTrainedAt: user.lastTrainedAt
    });

  } catch (error) {
    console.error("Error fetching training history:", error);
    return NextResponse.json(
      { error: "Failed to fetch training history" },
      { status: 500 }
    );
  }
}
