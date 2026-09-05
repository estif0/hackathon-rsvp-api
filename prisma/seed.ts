import "dotenv/config";
import { prisma } from "../src/config/db";
import { auth } from "../src/modules/auth/auth";

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.rsvp.deleteMany();
  await prisma.hackathon.deleteMany();
  await prisma.club.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Admin User via Better Auth API
  await auth.api.signUpEmail({
    body: {
      name: "Admin User",
      email: "admin@club.com",
      password: "AdminPassword123!",
    },
  });

  const admin = await prisma.user.update({
    where: { email: "admin@club.com" },
    data: { role: "admin" },
  });
  console.log("👤 Created admin user: admin@club.com / AdminPassword123!");

  // 2. Create Student Users
  await auth.api.signUpEmail({
    body: {
      name: "Alice Johnson",
      email: "alice@university.edu",
      password: "StudentPassword123!",
    },
  });
  const student1 = await prisma.user.findUniqueOrThrow({ where: { email: "alice@university.edu" } });

  await auth.api.signUpEmail({
    body: {
      name: "Bob Smith",
      email: "bob@university.edu",
      password: "StudentPassword123!",
    },
  });
  const student2 = await prisma.user.findUniqueOrThrow({ where: { email: "bob@university.edu" } });
  console.log("👤 Created student users: alice@university.edu, bob@university.edu");

  // 3. Create Tech Clubs
  const gdsc = await prisma.club.create({
    data: {
      name: "Google Developer Student Club (GDSC)",
      description: "Building developer skills and community solutions with modern tech.",
      ownerId: admin.id,
    },
  });

  const cyberClub = await prisma.club.create({
    data: {
      name: "Cybersecurity & CTF Society",
      description: "Hands-on network security, binary exploitation, and ethical hacking.",
      ownerId: admin.id,
    },
  });

  const roboticsClub = await prisma.club.create({
    data: {
      name: "Robotics & Hardware Guild",
      description: "Arduino, Raspberry Pi, PCB design, and autonomous robotics projects.",
      ownerId: admin.id,
    },
  });
  console.log("🏢 Created 3 tech clubs.");

  // 4. Create Hackathons
  const now = Date.now();
  const hackathon1 = await prisma.hackathon.create({
    data: {
      title: "AI Hackathon: Future of DevTools",
      description: "48 hours to build AI-assisted developer workflows and open-source tooling.",
      date: new Date(now + 86400000 * 14),
      maxAttendees: 50,
      clubId: gdsc.id,
    },
  });

  const hackathon2 = await prisma.hackathon.create({
    data: {
      title: "CyberDefense Collegiate CTF 2026",
      description: "Jeopardy-style capture-the-flag tournament testing cryptography and web security.",
      date: new Date(now + 86400000 * 21),
      maxAttendees: 30,
      clubId: cyberClub.id,
    },
  });

  const hackathon3 = await prisma.hackathon.create({
    data: {
      title: "RoboHacks: Autonomous Rovers",
      description: "Build, code, and race autonomous rovers around an obstacle track.",
      date: new Date(now + 86400000 * 30),
      maxAttendees: 20,
      clubId: roboticsClub.id,
    },
  });
  console.log("🚀 Created 3 hackathons with upcoming dates.");

  // 5. Create Sample RSVPs
  await prisma.rsvp.create({
    data: {
      userId: student1.id,
      hackathonId: hackathon1.id,
    },
  });

  await prisma.rsvp.create({
    data: {
      userId: student2.id,
      hackathonId: hackathon1.id,
    },
  });

  await prisma.rsvp.create({
    data: {
      userId: student1.id,
      hackathonId: hackathon2.id,
    },
  });
  console.log("🎫 Created sample member RSVPs.");

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
