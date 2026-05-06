import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';

async function generateTokens(userId: string) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  await RefreshToken.create({
    token: refreshToken,
    userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return { accessToken, refreshToken, expiresIn: 900 };
}

export async function register(email: string, password: string) {
  const existing = await User.findByEmail(email);
  if (existing) throw { status: 409, message: 'Email already registered' };
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });
  return generateTokens(user._id.toString());
}

export async function login(email: string, password: string) {
  const user = await User.findByEmail(email);
  if (!user) throw { status: 401, message: 'Invalid credentials' };
  const valid = await user.comparePassword(password);
  if (!valid) throw { status: 401, message: 'Invalid credentials' };
  await RefreshToken.deleteMany({ userId: user._id });
  return generateTokens(user._id.toString());
}

export async function refresh(refreshToken: string) {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw { status: 401, message: 'Invalid refresh token' };
  }
  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored) throw { status: 401, message: 'Refresh token already used or revoked' };
  await stored.deleteOne();
  return generateTokens(payload.sub);
}

export async function logout(refreshToken: string) {
  await RefreshToken.deleteOne({ token: refreshToken });
}
