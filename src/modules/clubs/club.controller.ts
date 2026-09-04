import type { RequestHandler } from "express";
import * as clubService from "./club.service";

export const getClubs: RequestHandler = async (_req, res, next) => {
  try {
    res.json(await clubService.getAllClubs());
  } catch (err) {
    next(err);
  }
};

export const getClub: RequestHandler = async (req, res, next) => {
  try {
    res.json(await clubService.getClubById(req.params.id as string));
  } catch (err) {
    next(err);
  }
};

export const createClub: RequestHandler = async (req, res, next) => {
  try {
    const { name, description } = req.body as { name: string; description?: string };

    if (!name?.trim()) {
      res.status(400).json({ message: "name is required" });
      return;
    }

    const club = await clubService.createClub(req.user!.id, { name, description });
    res.status(201).json(club);
  } catch (err) {
    next(err);
  }
};

export const updateClub: RequestHandler = async (req, res, next) => {
  try {
    const { name, description } = req.body as { name?: string; description?: string };
    res.json(await clubService.updateClub(req.params.id as string, { name, description }));
  } catch (err) {
    next(err);
  }
};

export const deleteClub: RequestHandler = async (req, res, next) => {
  try {
    await clubService.deleteClub(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
