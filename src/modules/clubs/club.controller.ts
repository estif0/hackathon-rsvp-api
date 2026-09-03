import type { RequestHandler } from "express";
import * as clubService from "./club.service.js";

export const getClubs: RequestHandler = async (_req, res, next) => {
  try {
    const clubs = await clubService.getAllClubs();
    res.json(clubs);
  } catch (err) {
    next(err);
  }
};

export const getClub: RequestHandler = async (req, res, next) => {
  try {
    const club = await clubService.getClubById(req.params.id);
    if (!club) {
      res.status(404).json({ message: "Club not found" });
      return;
    }
    res.json(club);
  } catch (err) {
    next(err);
  }
};

export const createClub: RequestHandler = async (req, res, next) => {
  try {
    const { name, description } = req.body as { name: string; description?: string };
    const club = await clubService.createClub({
      name,
      description,
      owner: { connect: { id: req.user!.id } },
    });
    res.status(201).json(club);
  } catch (err) {
    next(err);
  }
};

export const updateClub: RequestHandler = async (req, res, next) => {
  try {
    const club = await clubService.updateClub(req.params.id, req.body as object);
    res.json(club);
  } catch (err) {
    next(err);
  }
};

export const deleteClub: RequestHandler = async (req, res, next) => {
  try {
    await clubService.deleteClub(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
