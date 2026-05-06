import { Response, NextFunction } from 'express';
import * as tasksService from '../services/tasks.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import { AuthRequest } from '../middleware/auth.middleware';

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const task = await tasksService.create(req.userId!, req.body);
    return sendSuccess(res, task, 201);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function findAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await tasksService.findAll(req.userId!, req.query);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function findOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const task = await tasksService.findOne(req.params.id, req.userId!);
    return sendSuccess(res, task);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const task = await tasksService.update(req.params.id, req.userId!, req.body);
    return sendSuccess(res, task);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await tasksService.softDelete(req.params.id, req.userId!);
    return sendSuccess(res, { message: 'Task deleted' });
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function stats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await tasksService.getStats(req.userId!);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}
