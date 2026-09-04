import type { RequestHandler } from "express";
import * as hackathonService from "./hackathon.service";

export const getHackathons: RequestHandler = async (req, res, next) => {
  try {
    const { clubId } = req.query as { clubId?: string };
    res.json(await hackathonService.getAllHackathons(clubId));
  } catch (err) {
    next(err);
  }
};

export const getHackathon: RequestHandler = async (req, res, next) => {
  try {
    res.json(await hackathonService.getHackathonById(req.params.id as string));
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

    if (!title?.trim() || !date || !maxAttendees || !clubId) {
      res.status(400).json({ message: "title, date, maxAttendees, and clubId are required" });
      return;
    }

    const hackathon = await hackathonService.createHackathon({
      title,
      description,
      date: new Date(date),
      maxAttendees: Number(maxAttendees),
      clubId,
    });

    res.status(201).json(hackathon);
  } catch (err) {
    next(err);
  }
};

export const updateHackathon: RequestHandler = async (req, res, next) => {
  try {
    const { title, description, date, maxAttendees } = req.body as {
      title?: string;
      description?: string;
      date?: string;
      maxAttendees?: number;
    };

    res.json(
      await hackathonService.updateHackathon(req.params.id as string, {
        title,
        description,
        ...(date && { date: new Date(date) }),
        ...(maxAttendees && { maxAttendees: Number(maxAttendees) }),
      })
    );
  } catch (err) {
    next(err);
  }
};

export const deleteHackathon: RequestHandler = async (req, res, next) => {
  try {
    await hackathonService.deleteHackathon(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getHackathonAttendees: RequestHandler = async (req, res, next) => {
  try {
    res.json(await hackathonService.getHackathonRsvps(req.params.id as string));
  } catch (err) {
    next(err);
  }
};
