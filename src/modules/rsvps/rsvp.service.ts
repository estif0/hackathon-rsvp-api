import { prisma } from "../../config/db";
import { HttpError } from "../../lib/errors";

export const createRsvp = async (userId: string, hackathonId: string) => {
  return prisma.$transaction(async (tx) => {
    const hackathon = await tx.hackathon.findUnique({
      where: { id: hackathonId },
      include: { _count: { select: { rsvps: true } } },
    });

    if (!hackathon) throw new HttpError(404, "Hackathon not found");

    if (hackathon._count.rsvps >= hackathon.maxAttendees) {
      throw new HttpError(400, "Hackathon is at full capacity");
    }

    const existing = await tx.rsvp.findUnique({
      where: { userId_hackathonId: { userId, hackathonId } },
    });

    if (existing) throw new HttpError(409, "You have already RSVPed to this hackathon");

    return tx.rsvp.create({
      data: { userId, hackathonId },
      include: { hackathon: true },
    });
  });
};

export const getMyRsvps = async (userId: string) => {
  return prisma.rsvp.findMany({
    where: { userId },
    include: { hackathon: { include: { club: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteRsvp = async (userId: string, hackathonId: string) => {
  const rsvp = await prisma.rsvp.findUnique({
    where: { userId_hackathonId: { userId, hackathonId } },
  });

  if (!rsvp) throw new HttpError(404, "RSVP not found");

  return prisma.rsvp.delete({
    where: { userId_hackathonId: { userId, hackathonId } },
  });
};
