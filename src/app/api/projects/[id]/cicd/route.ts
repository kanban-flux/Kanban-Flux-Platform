import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { DEPLOY_TEMPLATES } = await import("@/lib/cicd/templates");

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({
    templates: DEPLOY_TEMPLATES,
    githubRepo: project.githubRepo,
    githubUrl: project.githubUrl,
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { templateId } = await req.json();

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project?.githubRepo) {
    return NextResponse.json({ error: "Project has no GitHub repo" }, { status: 400 });
  }

  const repoName = project.githubRepo.split("/")[1];

  if (templateId === "all") {
    const { setupAllCI } = await import("@/lib/cicd/setup");
    const files = await setupAllCI(repoName);
    return NextResponse.json({ files, message: "All CI/CD workflows created" });
  }

  const { setupDeployWorkflow } = await import("@/lib/cicd/setup");
  await setupDeployWorkflow(repoName, templateId);
  return NextResponse.json({ message: `Deploy workflow for ${templateId} created` });
}
