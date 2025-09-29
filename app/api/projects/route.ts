import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authUser } from "../_utils";

export async function GET(req: NextRequest) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      milestones: true,
      transcripts: {
        include: { analysis: true },
        orderBy: { createdAt: "desc" }
      },
      insights: {
        orderBy: { createdAt: "desc" }
      },
      _count: {
        select: {
          milestones: true,
          transcripts: true,
          insights: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, clientName, clientEmail, milestones } = await req.json();

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name,
      description,
      clientName,
      clientEmail,
      milestones: milestones ? {
        create: milestones.map((m: any) => ({
          title: m.title,
          description: m.description,
          dueDate: m.dueDate ? new Date(m.dueDate) : null
        }))
      } : undefined
    },
    include: {
      milestones: true,
      _count: {
        select: {
          milestones: true,
          transcripts: true,
          insights: true
        }
      }
    }
  });

  return NextResponse.json({ project });
}
