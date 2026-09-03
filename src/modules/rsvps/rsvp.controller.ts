import type { RequestHandler } from "express";
import * as rsvpService from "./rsvp.service.js";

export const createRsvp: RequestHandler = async (req, res, next) => {
  try {
    const { hackathonId } = req.body as { hackathonId: string };
    const rsvp = await rsvpService.createRsvp(req.user!.id, hackathonId);
    res.status(201).json(rsvp);
  } catch (err) {
    next(err);
  }
};

export const getMyRsvps: RequestHandler = async (req, res, next) => {
  try {
    const rsvps = await rsvpService.getMyRsvps(req.user!.id);
    res.json(rsvps);
  } catch (err) {
    next(err);
  }
};

export const deleteRsvp: RequestHandler = async (req, res, next) => {
  try {
    await rsvpService.deleteRsvp(req.user!.id, req.params.hackathonId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
