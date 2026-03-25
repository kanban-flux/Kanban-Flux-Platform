# Kanban Flux v2 - Design Spec

## Context
Kanban Flux is an AI agent orchestration platform. This spec covers 3 parallel workstreams to bring it to production quality.

## Frente 1: Bug Fixes
- Replace hardcoded "demo-user" with NextAuth session
- Add auth middleware to protect all routes
- Add error boundaries (error.tsx) to all page routes
- Implement Edit Agent modal
- Add Cancel Run button in card modal
- Replace "default-workspace" with session-based workspace

## Frente 2: Project Model + GitHub Integration
- New Prisma model: Project (name, description, githubRepo, workspaceId, boards[], agents[])
- Add boardId foreign key to Board pointing to Project
- GitHub integration via octokit + PAT stored encrypted
- Auto-create repos in org kanban-flux on project creation
- New agent tools: git_commit, git_push, create_pr, merge_pr
- New page /projects with project management UI
- SSH key via GITHUB_TOKEN env var

## Frente 3: UI/UX Improvements
- Real notification system replacing skeleton bell
- Pipeline visualization for agent run trees
- Agent profile pages with metrics

## GitHub Org
- URL: https://github.com/kanban-flux
- Auth: Personal Access Token (encrypted in DB)
