import type { RequestHandler } from "express";
import * as hackathonService from "./hackathon.service.js";

export const getHackathons: RequestHandler = async (req, res, next) => {
  try {
    const { clubId } = req.query as { clubId?: string };
    const hackathons = await hackathonService.getAllHackathons(clubId);
    res.json(hackathons);
  } catch (err) {
    next(err);
  }
};

export const getHackathon: RequestHandler = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.getHackathonById(req.params.id);
    if (!hackathon) {
      res.status(404).json({ message: "Hackathon not found" });
      return;
    }
    res.json(hackathon);
  } catch (err) {
    next(err);
  }
};

export const createHackathon: RequestHandler = async (req, res, next) => {
  try {
    const { title, description, date, maxAttendees, clubId } = req.body as {
      title: string;
      description?: string;
      date: string;
      maxAttendees: number;
      clubId: string;
    };
    const hackathon = await hackathonService.createHackathon({
      title,
      description,
      date: new Date(date),
      maxAttendees,
      club: { connect: { id: clubId } },
    });
    res.status(201).json(hackathon);
  } catch (err) {
    next(err);
  }
};

export const updateHackathon: RequestHandler = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.updateHackathon(
      req.params.id,
      req.body as object
    );
    res.json(hackathon);
  } catch (err) {
    next(err);
  }
};

export const deleteHackathon: RequestHandler = async (req, res, next) => {
  try {
    await hackathonService.deleteHackathon(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
