import { prisma } from "../../config/db";
import { HttpError } from "../../lib/errors";
import type { Prisma } from "@prisma/client";

export const getAllClubs = async () => {
  return prisma.club.findMany({
    include: { _count: { select: { hackathons: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const getClubById = async (id: string) => {
  const club = await prisma.club.findUnique({
    where: { id },
    include: { hackathons: true },
  });

  if (!club) throw new HttpError(404, "Club not found");
  return club;
};

export const createClub = async (
  ownerId: string,
  data: Pick<Prisma.ClubCreateInput, "name" | "description">
) => {
  return prisma.club.create({
    data: { ...data, ownerId },
  });
};

export const updateClub = async (
  id: string,
  data: Pick<Prisma.ClubUpdateInput, "name" | "description">
) => {
  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) throw new HttpError(404, "Club not found");

  return prisma.club.update({ where: { id }, data });
};

export const deleteClub = async (id: string) => {
  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) throw new HttpError(404, "Club not found");

  return prisma.club.delete({ where: { id } });
};
