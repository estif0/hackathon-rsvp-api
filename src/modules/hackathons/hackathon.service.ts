import { prisma } from "../../config/db.js";
import type { Prisma } from "@prisma/client";

export const getAllHackathons = async (clubId?: string) => {
  // TODO: implement
  return prisma.hackathon.findMany({
    where: clubId ? { clubId } : undefined,
  });
};

export const getHackathonById = async (id: string) => {
  // TODO: implement (throw 404 if not found)
  return prisma.hackathon.findUnique({ where: { id } });
};

export const createHackathon = async (data: Prisma.HackathonCreateInput) => {
  // TODO: implement
  return prisma.hackathon.create({ data });
};

export const updateHackathon = async (
  id: string,
  data: Prisma.HackathonUpdateInput
) => {
  // TODO: implement (throw 404 if not found)
  return prisma.hackathon.update({ where: { id }, data });
};

export const deleteHackathon = async (id: string) => {
  // TODO: implement (throw 404 if not found)
  return prisma.hackathon.delete({ where: { id } });
};
