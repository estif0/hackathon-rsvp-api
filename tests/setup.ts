import { beforeAll, afterAll } from "vitest";
import { prisma } from "../src/config/db";

export const cleanDb = async (): Promise<void> => {
  await prisma.rsvp.deleteMany();
  await prisma.hackathon.deleteMany();
  await prisma.club.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
};

beforeAll(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
  await prisma.$disconnect();
});
