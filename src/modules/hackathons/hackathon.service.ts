import { prisma } from "../../config/db";
import { HttpError } from "../../lib/errors";
import type { Prisma } from "@prisma/client";

export const getAllHackathons = async (clubId?: string) => {
  return prisma.hackathon.findMany({
    where: clubId ? { clubId } : undefined,
    include: { _count: { select: { rsvps: true } } },
    orderBy: { date: "asc" },
  });
};

export const getHackathonById = async (id: string) => {
  const hackathon = await prisma.hackathon.findUnique({
    where: { id },
    include: { _count: { select: { rsvps: true } }, club: true },
  });

  if (!hackathon) throw new HttpError(404, "Hackathon not found");
  return hackathon;
};

export const createHackathon = async (
  data: Pick<
    Prisma.HackathonUncheckedCreateInput,
    "title" | "description" | "date" | "maxAttendees" | "clubId"
  >
) => {
  const clubExists = await prisma.club.findUnique({ where: { id: data.clubId } });
  if (!clubExists) throw new HttpError(404, "Club not found");

  return prisma.hackathon.create({ data });
};

export const updateHackathon = async (
  id: string,
  data: Pick<Prisma.HackathonUpdateInput, "title" | "description" | "date" | "maxAttendees">
) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id } });
  if (!hackathon) throw new HttpError(404, "Hackathon not found");

  return prisma.hackathon.update({ where: { id }, data });
};

export const deleteHackathon = async (id: string) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id } });
  if (!hackathon) throw new HttpError(404, "Hackathon not found");

  return prisma.hackathon.delete({ where: { id } });
};

export const getHackathonRsvps = async (id: string) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id } });
  if (!hackathon) throw new HttpError(404, "Hackathon not found");

  return prisma.rsvp.findMany({
    where: { hackathonId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
};
