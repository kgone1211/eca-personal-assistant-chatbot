import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authUser } from "../_utils";

export async function GET(req: NextRequest) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const projectId = url.searchParams.get("project_id");

  if (projectId) {
    // Get specific project dashboard
    const projectIdNum = parseInt(projectId);
    const project = await prisma.project.findFirst({
      where: { id: projectIdNum, userId: user.id },
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

    // Calculate project metrics
    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(m => m.status === "completed").length;
    const totalTranscripts = project.transcripts.length;
    const totalInsights = project.insights.length;
    const openInsights = project.insights.filter(i => i.status === "open").length;
    const criticalInsights = project.insights.filter(i => i.severity === "critical").length;

    // Calculate sentiment distribution
    const sentimentCounts = project.transcripts.reduce((acc, t) => {
      if (t.analysis) {
        acc[t.analysis.sentiment] = (acc[t.analysis.sentiment] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      project: {
        ...project,
        metrics: {
          totalMilestones,
          completedMilestones,
          completionRate: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
          totalTranscripts,
          totalInsights,
          openInsights,
          criticalInsights,
          sentimentCounts
        }
      }
    });
  } else {
    // Get overall dashboard
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        milestones: true,
        transcripts: {
          include: { analysis: true }
        },
        insights: true,
        _count: {
          select: {
            milestones: true,
            transcripts: true,
            insights: true
          }
        }
      }
    });

    // Calculate overall metrics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === "active").length;
    const completedProjects = projects.filter(p => p.status === "completed").length;
    const totalMilestones = projects.reduce((sum, p) => sum + p._count.milestones, 0);
    const completedMilestones = projects.reduce((sum, p) => 
      sum + p.milestones.filter(m => m.status === "completed").length, 0
    );
    const totalTranscripts = projects.reduce((sum, p) => sum + p._count.transcripts, 0);
    const totalInsights = projects.reduce((sum, p) => sum + p._count.insights, 0);
    const criticalInsights = projects.reduce((sum, p) => 
      sum + p.insights.filter(i => i.severity === "critical").length, 0
    );

    // Recent activity
    const recentTranscripts = await prisma.transcript.findMany({
      where: { project: { userId: user.id } },
      include: { 
        project: true,
        analysis: true 
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const recentInsights = await prisma.projectInsight.findMany({
      where: { project: { userId: user.id } },
      include: { project: true },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    return NextResponse.json({
      overview: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalMilestones,
        completedMilestones,
        completionRate: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
        totalTranscripts,
        totalInsights,
        criticalInsights
      },
      projects: projects.map(p => ({
        ...p,
        metrics: {
          totalMilestones: p._count.milestones,
          completedMilestones: p.milestones.filter(m => m.status === "completed").length,
          totalTranscripts: p._count.transcripts,
          totalInsights: p._count.insights,
          criticalInsights: p.insights.filter(i => i.severity === "critical").length
        }
      })),
      recentActivity: {
        transcripts: recentTranscripts,
        insights: recentInsights
      }
    });
  }
}
