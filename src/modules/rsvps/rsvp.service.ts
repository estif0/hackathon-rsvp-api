import { prisma } from "../../config/db.js";

export const createRsvp = async (userId: string, hackathonId: string) => {
  // TODO: wrap in prisma.$transaction to atomically:
  //   1. Fetch the hackathon and count existing RSVPs
  //   2. Return 400 if at capacity (rsvps.length >= maxAttendees)
  //   3. Return 409 if user already has an RSVP (or let the @@unique bubble up)
  //   4. Create and return the RSVP
  return prisma.rsvp.create({
    data: {
      user: { connect: { id: userId } },
      hackathon: { connect: { id: hackathonId } },
    },
  });
};

export const getMyRsvps = async (userId: string) => {
  // TODO: implement
  return prisma.rsvp.findMany({
    where: { userId },
    include: { hackathon: true },
  });
};

export const deleteRsvp = async (userId: string, hackathonId: string) => {
  // TODO: implement (throw 404 if RSVP doesn't exist for this user)
  return prisma.rsvp.delete({
    where: { userId_hackathonId: { userId, hackathonId } },
  });
};
