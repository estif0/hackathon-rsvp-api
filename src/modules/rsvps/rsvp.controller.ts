import type { RequestHandler } from "express";
import * as rsvpService from "./rsvp.service";

export const createRsvp: RequestHandler = async (req, res, next) => {
  try {
    const { hackathonId } = req.body as { hackathonId: string };

    if (!hackathonId) {
      res.status(400).json({ message: "hackathonId is required" });
      return;
    }

    const rsvp = await rsvpService.createRsvp(req.user!.id, hackathonId);
    res.status(201).json(rsvp);
  } catch (err) {
    next(err);
  }
};

export const getMyRsvps: RequestHandler = async (req, res, next) => {
  try {
    res.json(await rsvpService.getMyRsvps(req.user!.id));
  } catch (err) {
    next(err);
  }
};

export const deleteRsvp: RequestHandler = async (req, res, next) => {
  try {
    await rsvpService.deleteRsvp(req.user!.id, req.params.hackathonId as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
