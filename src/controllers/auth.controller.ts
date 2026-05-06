import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.utils';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const tokens = await authService.register(req.body.email, req.body.password);
    return sendSuccess(res, tokens, 201);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const tokens = await authService.login(req.body.email, req.body.password);
    return sendSuccess(res, tokens);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    return sendSuccess(res, tokens);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.body.refreshToken);
    return sendSuccess(res, { message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}
