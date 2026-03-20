import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.label.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: "demo-user",
        name: "Demo User",
        email: "demo@kanbanflux.com",
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        name: "Sarah Chen",
        email: "sarah.chen@kanbanflux.com",
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        name: "Marcus Wright",
        email: "marcus.wright@kanbanflux.com",
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        name: "Elena Rodriguez",
        email: "elena.rodriguez@kanbanflux.com",
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        name: "David Kim",
        email: "david.kim@kanbanflux.com",
        avatar: null,
      },
    }),
  ]);

  const [demoUser, sarah, marcus, elena, david] = users;

  // Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      id: "default-workspace",
      name: "Kanban Flux Workspace",
    },
  });

  // Create Workspace Members
  await Promise.all([
    prisma.workspaceMember.create({
      data: { userId: demoUser.id, workspaceId: workspace.id, role: "ADMIN" },
    }),
    prisma.workspaceMember.create({
      data: { userId: sarah.id, workspaceId: workspace.id, role: "ADMIN" },
    }),
    prisma.workspaceMember.create({
      data: { userId: marcus.id, workspaceId: workspace.id, role: "MEMBER" },
    }),
    prisma.workspaceMember.create({
      data: { userId: elena.id, workspaceId: workspace.id, role: "MEMBER" },
    }),
    prisma.workspaceMember.create({
      data: { userId: david.id, workspaceId: workspace.id, role: "VIEWER" },
    }),
  ]);

  // Create Labels
  const labels = await Promise.all([
    prisma.label.create({ data: { name: "Bug", color: "#FF5630" } }),
    prisma.label.create({ data: { name: "Feature", color: "#0052CC" } }),
    prisma.label.create({ data: { name: "Urgent", color: "#FF8B00" } }),
    prisma.label.create({ data: { name: "Design", color: "#6554C0" } }),
    prisma.label.create({ data: { name: "Backend", color: "#00B8D9" } }),
    prisma.label.create({ data: { name: "Frontend", color: "#36B37E" } }),
  ]);

  const [bugLabel, featureLabel, urgentLabel, designLabel, backendLabel, frontendLabel] = labels;

  // Board 1: Product Launch Q4
  const board1 = await prisma.board.create({
    data: {
      name: "Product Launch Q4",
      description: "Q4 product launch planning and execution",
      status: "ACTIVE",
      workspaceId: workspace.id,
      columns: {
        create: [
          {
            title: "To Do",
            position: 0,
            cards: {
              create: [
                {
                  title: "Design landing page mockups",
                  description: "Create high-fidelity mockups for the new product landing page. Include mobile and desktop versions.",
                  position: 0,
                  dueDate: new Date("2026-04-15"),
                },
                {
                  title: "Write product announcement blog post",
                  description: "Draft the official blog post announcing the Q4 product launch.",
                  position: 1,
                },
                {
                  title: "Set up analytics tracking",
                  description: "Implement event tracking for all key user interactions on the launch page.",
                  position: 2,
                  dueDate: new Date("2026-04-20"),
                },
              ],
            },
          },
          {
            title: "In Progress",
            position: 1,
            cards: {
              create: [
                {
                  title: "Implement Real-time Collaboration Webhooks",
                  description: "The goal is to add real-time webhooks so external tools can subscribe and be notified of the board's. The current API also lacks proper error handling for subscription conflicts.",
                  position: 0,
                  dueDate: new Date("2026-04-10"),
                },
                {
                  title: "API rate limiting implementation",
                  description: "Add rate limiting to all public API endpoints using a sliding window algorithm.",
                  position: 1,
                },
              ],
            },
          },
          {
            title: "Done",
            position: 2,
            cards: {
              create: [
                {
                  title: "Database schema design",
                  description: "Design and implement the database schema for the new features.",
                  position: 0,
                },
                {
                  title: "CI/CD pipeline setup",
                  description: "Configure automated testing and deployment pipeline.",
                  position: 1,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      columns: {
        include: {
          cards: true,
        },
      },
    },
  });

  // Add labels and members to cards
  const todoCards = board1.columns[0].cards;
  const inProgressCards = board1.columns[1].cards;
  const doneCards = board1.columns[2].cards;

  // Labels
  await Promise.all([
    prisma.cardLabel.create({ data: { cardId: todoCards[0].id, labelId: designLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: todoCards[0].id, labelId: frontendLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: todoCards[2].id, labelId: backendLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: inProgressCards[0].id, labelId: featureLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: inProgressCards[0].id, labelId: backendLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: inProgressCards[1].id, labelId: urgentLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: doneCards[0].id, labelId: backendLabel.id } }),
  ]);

  // Members
  await Promise.all([
    prisma.cardMember.create({ data: { cardId: todoCards[0].id, userId: sarah.id } }),
    prisma.cardMember.create({ data: { cardId: todoCards[0].id, userId: elena.id } }),
    prisma.cardMember.create({ data: { cardId: inProgressCards[0].id, userId: marcus.id } }),
    prisma.cardMember.create({ data: { cardId: inProgressCards[0].id, userId: demoUser.id } }),
    prisma.cardMember.create({ data: { cardId: inProgressCards[1].id, userId: marcus.id } }),
    prisma.cardMember.create({ data: { cardId: doneCards[0].id, userId: elena.id } }),
    prisma.cardMember.create({ data: { cardId: doneCards[1].id, userId: demoUser.id } }),
  ]);

  // Checklists for "Implement Real-time Collaboration Webhooks"
  await prisma.checklist.create({
    data: {
      title: "Implementation Tasks",
      cardId: inProgressCards[0].id,
      items: {
        create: [
          { text: "Design webhook payload schema", completed: true },
          { text: "Implement subscription endpoint", completed: true },
          { text: "Add retry logic for failed deliveries", completed: false },
          { text: "Write integration tests", completed: false },
          { text: "Update API documentation", completed: false },
        ],
      },
    },
  });

  // Comments
  await Promise.all([
    prisma.comment.create({
      data: {
        text: "I've started working on the webhook payload schema. Should we use CloudEvents format?",
        userId: marcus.id,
        cardId: inProgressCards[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        text: "Good idea! CloudEvents is a great standard. Let's go with that.",
        userId: sarah.id,
        cardId: inProgressCards[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        text: "The mockups look great! Can we also add a dark mode variant?",
        userId: david.id,
        cardId: todoCards[0].id,
      },
    }),
  ]);

  // Board 2: API Infrastructure
  await prisma.board.create({
    data: {
      name: "API Infrastructure",
      description: "Core backend infrastructure tasks",
      status: "ACTIVE",
      workspaceId: workspace.id,
      columns: {
        create: [
          { title: "Backlog", position: 0 },
          { title: "In Progress", position: 1 },
          { title: "Review", position: 2 },
          { title: "Done", position: 3 },
        ],
      },
    },
  });

  // Board 3: Marketing Campaign
  await prisma.board.create({
    data: {
      name: "Marketing Campaign",
      description: "Social media and PR planning",
      status: "PAUSED",
      workspaceId: workspace.id,
      columns: {
        create: [
          { title: "Ideas", position: 0 },
          { title: "Planning", position: 1 },
          { title: "Execution", position: 2 },
          { title: "Completed", position: 3 },
        ],
      },
    },
  });

  // Board 4: Archived board
  await prisma.board.create({
    data: {
      name: "2023 Goals",
      description: "Historical goals and milestones",
      status: "ARCHIVED",
      workspaceId: workspace.id,
      columns: {
        create: [
          { title: "Q1", position: 0 },
          { title: "Q2", position: 1 },
          { title: "Q3", position: 2 },
          { title: "Q4", position: 3 },
        ],
      },
    },
  });

  console.log("Seed data created successfully!");
  console.log(`- ${users.length} users`);
  console.log(`- 1 workspace`);
  console.log(`- ${labels.length} labels`);
  console.log(`- 4 boards`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
