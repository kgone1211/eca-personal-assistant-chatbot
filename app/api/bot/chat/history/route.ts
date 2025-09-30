import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authUser } from "../../../_utils";

export async function GET(req: NextRequest) {
  try {
    const { user } = await authUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Fetch recent messages for this user
    const messages = await prisma.messageLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" }, // Oldest first for proper conversation flow
      take: limit,
      skip: offset,
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true
      }
    });

    // Group messages into conversations (simple approach: group by date)
    const conversations = messages.reduce((acc: any[], message) => {
      const date = message.createdAt.toDateString();
      const lastConversation = acc[acc.length - 1];
      
      if (lastConversation && lastConversation.date === date) {
        lastConversation.messages.push(message);
      } else {
        acc.push({
          date,
          messages: [message]
        });
      }
      
      return acc;
    }, []);

    return NextResponse.json({
      conversations,
      totalMessages: messages.length,
      hasMore: messages.length === limit
    });

  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await authUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Delete all message logs for this user
    await prisma.messageLog.deleteMany({
      where: { userId: user.id }
    });

    return NextResponse.json({
      success: true,
      message: "Chat history cleared successfully"
    });

  } catch (error) {
    console.error("Error clearing chat history:", error);
    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500 }
    );
  }
}
