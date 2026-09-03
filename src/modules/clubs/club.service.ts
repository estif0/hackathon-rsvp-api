import { prisma } from "../../config/db.js";
import type { Prisma } from "@prisma/client";

export const getAllClubs = async () => {
  // TODO: implement
  return prisma.club.findMany();
};

export const getClubById = async (id: string) => {
  // TODO: implement (throw 404 if not found)
  return prisma.club.findUnique({ where: { id } });
};

export const createClub = async (
  data: Prisma.ClubCreateInput
) => {
  // TODO: implement
  return prisma.club.create({ data });
};

export const updateClub = async (
  id: string,
  data: Prisma.ClubUpdateInput
) => {
  // TODO: implement (throw 404 if not found)
  return prisma.club.update({ where: { id }, data });
};

export const deleteClub = async (id: string) => {
  // TODO: implement (throw 404 if not found)
  return prisma.club.delete({ where: { id } });
};
