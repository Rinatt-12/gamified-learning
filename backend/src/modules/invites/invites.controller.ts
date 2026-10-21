import { Request, Response, NextFunction } from 'express';
import * as invitesService from './invites.service.ts';
import { createInviteSchema } from './invites.schema.ts';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createInviteSchema.parse(req.body);
    const invites = await invitesService.createInvites(data, req.user!.id);
    res.status(201).json({ invites });
  } catch (error) {
    next(error);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const invites = await invitesService.listInvites();
    res.json(invites);
  } catch (error) {
    next(error);
  }
}

export async function revoke(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await invitesService.revokeInvite(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function validate(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.params;
    const result = await invitesService.validateInvite(code);
    res.json(result);
  } catch (error) {
    next(error);
  }
}