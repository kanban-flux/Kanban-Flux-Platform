import { commitFile } from "@/lib/github";
import { CI_WORKFLOW, DEPLOY_TEMPLATES, type DeployTemplate } from "./templates";

export async function setupCI(repoName: string): Promise<void> {
  // Push the base CI workflow
  await commitFile(
    repoName,
    ".github/workflows/ci.yml",
    CI_WORKFLOW,
    "ci: add CI workflow for build and lint"
  );
}

export async function setupDeployWorkflow(repoName: string, templateId: string): Promise<void> {
  const template = DEPLOY_TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error(`Deploy template "${templateId}" not found`);

  await commitFile(
    repoName,
    `.github/workflows/deploy-${templateId}.yml`,
    template.workflow,
    `ci: add ${template.name} deploy workflow`
  );
}

export async function setupAllCI(repoName: string): Promise<string[]> {
  const files: string[] = [];

  // Always push CI workflow
  await commitFile(repoName, ".github/workflows/ci.yml", CI_WORKFLOW, "ci: add CI workflow");
  files.push(".github/workflows/ci.yml");

  // Push all deploy templates (inactive by default - user activates by adding secrets)
  for (const template of DEPLOY_TEMPLATES) {
    await commitFile(
      repoName,
      `.github/workflows/deploy-${template.id}.yml`,
      template.workflow,
      `ci: add ${template.name} deploy template`
    );
    files.push(`.github/workflows/deploy-${template.id}.yml`);
  }

  return files;
}

export { DEPLOY_TEMPLATES };
export type { DeployTemplate };
