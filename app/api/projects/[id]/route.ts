import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authUser } from "../_utils";

export async function GET(req: NextRequest, ctx: { params: { id: string }}) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = parseInt(ctx.params.id);
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
    include: {
      milestones: {
        orderBy: { createdAt: "asc" }
      },
      transcripts: {
        include: { analysis: true },
        orderBy: { createdAt: "desc" }
      },
      insights: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PUT(req: NextRequest, ctx: { params: { id: string }}) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = parseInt(ctx.params.id);
  const { name, description, status, clientName, clientEmail, endDate } = await req.json();

  const project = await prisma.project.updateMany({
    where: { id: projectId, userId: user.id },
    data: {
      name,
      description,
      status,
      clientName,
      clientEmail,
      endDate: endDate ? new Date(endDate) : null,
      updatedAt: new Date()
    }
  });

  if (project.count === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string }}) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = parseInt(ctx.params.id);
  
  const deleted = await prisma.project.deleteMany({
    where: { id: projectId, userId: user.id }
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
