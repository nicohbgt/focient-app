import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '@focient/database';

const SALT = process.env.AUTH_SALT || 'focient_secure_salt_2026';
const TOKEN_EXPIRY_DAYS = 30;

function getDbFilePaths(): string[] {
  const paths = new Set<string>();
  paths.add(path.join(process.cwd(), '.focient_local_auth_db.json'));
  paths.add(path.join(process.cwd(), 'apps', 'web', '.focient_local_auth_db.json'));
  const parentPath = path.resolve(process.cwd(), '..', '.focient_local_auth_db.json');
  if (fs.existsSync(parentPath)) paths.add(parentPath);
  return Array.from(paths);
}

function getPrimaryDbPath(): string {
  const candidates = getDbFilePaths();
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(process.cwd(), '.focient_local_auth_db.json');
}

export interface LocalUserRecord {
  id: string;
  email: string;
  name: string;
  username: string;
  passwordHash: string;
  roleArchetype: string;
  occupancy: string;
  workingRhythm: string;
  schedulingStyle: string;
  workHourStart: string;
  workHourEnd: string;
  startWorkTime: string;
  endWorkTime: string;
  dailyCapacityMinutes: number;
  restTimePerTask: number;
  quietHourStart?: string;
  quietHourEnd?: string;
  quietHourEnabled?: boolean;
  isOnboardingCompleted: boolean;
  createdAt: string;
}

export interface LocalSessionRecord {
  token: string;
  tokenHash: string;
  userId: string;
  expiresAt: string;
  revokedAt?: string | null;
}

export interface LocalCategoryRecord {
  id: string;
  userId: string;
  name: string;
  colorHex: string;
  focusType: string;
  isDefault: boolean;
  createdAt: string;
}

export interface LocalTaskRecord {
  id: string;
  userId: string;
  title: string;
  durationMinutes: number;
  priority: string;
  energyLevel: string;
  status: string;
  categoryName: string;
  categoryColor: string;
  focusType: string;
  restMinutes: number;
  dateDisplay: string;
  startHourDisplay: string;
  needRestAfter: boolean;
  isBacklog: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  recurrenceDays?: any;
  createdAt: string;
}

export interface LocalNotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface LocalDbSchema {
  users: LocalUserRecord[];
  sessions: LocalSessionRecord[];
  tasks: LocalTaskRecord[];
  categories: LocalCategoryRecord[];
  notifications: LocalNotificationRecord[];
}

/**
 * File-backed persistent fallback database for local dev / offline resilience
 */
export function readLocalDb(): LocalDbSchema {
  const primary = getPrimaryDbPath();
  try {
    if (fs.existsSync(primary)) {
      const data = fs.readFileSync(primary, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      };
    }
  } catch (err) {
    console.warn('Failed to read local DB file:', err);
  }
  return { users: [], sessions: [], tasks: [], categories: [], notifications: [] };
}

export function writeLocalDb(db: LocalDbSchema): void {
  const content = JSON.stringify(db, null, 2);
  const targets = getDbFilePaths();
  for (const target of targets) {
    try {
      const parentDir = path.dirname(target);
      if (fs.existsSync(parentDir)) {
        fs.writeFileSync(target, content, 'utf-8');
      }
    } catch (err) {
      console.warn(`Failed to write local DB file at ${target}:`, err);
    }
  }
}

export function saveUserToLocalDb(user: LocalUserRecord): void {
  const db = readLocalDb();
  const existingIdx = db.users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase() || u.id === user.id);
  if (existingIdx >= 0) {
    db.users[existingIdx] = { ...db.users[existingIdx], ...user };
  } else {
    db.users.push(user);
  }
  writeLocalDb(db);
}

export function findLocalUserByEmail(email: string): LocalUserRecord | null {
  const db = readLocalDb();
  return db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

export function findLocalUserById(id: string): LocalUserRecord | null {
  const db = readLocalDb();
  return db.users.find((u) => u.id === id) || null;
}

export function deleteLocalUserByEmail(email: string): boolean {
  const db = readLocalDb();
  const cleanEmail = email.trim().toLowerCase();
  const targetUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!targetUser) return false;

  db.users = db.users.filter((u) => u.email.toLowerCase() !== cleanEmail);
  db.sessions = db.sessions.filter((s) => s.userId !== targetUser.id);
  db.tasks = db.tasks.filter((t) => t.userId !== targetUser.id);
  db.categories = db.categories.filter((c) => c.userId !== targetUser.id);
  db.notifications = db.notifications.filter((n) => n.userId !== targetUser.id);
  writeLocalDb(db);
  return true;
}

export function resetLocalDb(): void {
  writeLocalDb({ users: [], sessions: [], tasks: [], categories: [], notifications: [] });
}

export function updateLocalUserPassword(email: string, newPasswordHash: string): boolean {
  const db = readLocalDb();
  const cleanEmail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (user) {
    user.passwordHash = newPasswordHash;
    // Revoke previous sessions on password change
    db.sessions = db.sessions.filter((s) => s.userId !== user.id);
    writeLocalDb(db);
    return true;
  }
  return false;
}

export async function updateUserPasswordInAllStores(email: string, newPassword: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const newPasswordHash = hashPassword(newPassword);

  // 1. Update in local file DB
  const localUpdated = updateLocalUserPassword(cleanEmail, newPasswordHash);

  // 2. Update in Prisma PostgreSQL (if available)
  let prismaUpdated = false;
  try {
    const updated = await prisma.user.update({
      where: { email: cleanEmail },
      data: { passwordHash: newPasswordHash },
    });
    if (updated) {
      prismaUpdated = true;
      await prisma.session.deleteMany({
        where: { userId: updated.id },
      }).catch(() => {});
    }
  } catch {
    // PostgreSQL is offline or user not found in Prisma
  }

  return localUpdated || prismaUpdated;
}

export function saveTaskToLocalDb(task: LocalTaskRecord): void {
  const db = readLocalDb();
  const existingIdx = db.tasks.findIndex((t) => t.id === task.id && t.userId === task.userId);
  if (existingIdx >= 0) {
    db.tasks[existingIdx] = { ...db.tasks[existingIdx], ...task };
  } else {
    db.tasks.unshift(task);
  }
  writeLocalDb(db);
}

export function getTasksFromLocalDb(userId: string): LocalTaskRecord[] {
  const db = readLocalDb();
  return db.tasks.filter((t) => t.userId === userId);
}

export function updateTaskInLocalDb(userId: string, taskId: string, patch: Partial<LocalTaskRecord>): boolean {
  const db = readLocalDb();
  const targetIdx = db.tasks.findIndex((t) => t.id === taskId && t.userId === userId);
  if (targetIdx >= 0) {
    db.tasks[targetIdx] = { ...db.tasks[targetIdx], ...patch };
    writeLocalDb(db);
    return true;
  }
  return false;
}

export function deleteTaskFromLocalDb(userId: string, taskId: string): boolean {
  const db = readLocalDb();
  const initialLen = db.tasks.length;
  db.tasks = db.tasks.filter((t) => !(t.id === taskId && t.userId === userId));
  if (db.tasks.length !== initialLen) {
    writeLocalDb(db);
    return true;
  }
  return false;
}

export function saveCategoriesToLocalDb(
  userId: string,
  categories: Array<{
    id?: string;
    name: string;
    colorHex?: string;
    colorToken?: string;
    focusType?: string;
    isDefault?: boolean;
  }>
): void {
  const db = readLocalDb();
  const now = new Date().toISOString();
  for (const cat of categories) {
    const existingIdx = db.categories.findIndex(
      (c) => c.userId === userId && c.name.toLowerCase() === cat.name.toLowerCase()
    );
    const catRecord: LocalCategoryRecord = {
      id: cat.id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      name: cat.name,
      colorHex: cat.colorHex || cat.colorToken || '#0284C7',
      focusType: cat.focusType || 'High',
      isDefault: cat.isDefault !== undefined ? cat.isDefault : true,
      createdAt: now,
    };
    if (existingIdx >= 0) {
      db.categories[existingIdx] = { ...db.categories[existingIdx], ...catRecord };
    } else {
      db.categories.push(catRecord);
    }
  }
  writeLocalDb(db);
}

export function getCategoriesFromLocalDb(userId: string): LocalCategoryRecord[] {
  const db = readLocalDb();
  return db.categories.filter((c) => c.userId === userId);
}

export function deleteCategoryFromLocalDb(userId: string, categoryIdOrName: string): boolean {
  const db = readLocalDb();
  const initialLen = db.categories.length;
  db.categories = db.categories.filter(
    (c) => !(c.userId === userId && (c.id === categoryIdOrName || c.name === categoryIdOrName))
  );
  if (db.categories.length !== initialLen) {
    writeLocalDb(db);
    return true;
  }
  return false;
}

export function saveSessionToLocalDb(session: LocalSessionRecord): void {
  const db = readLocalDb();
  const existingIdx = db.sessions.findIndex((s) => s.tokenHash === session.tokenHash);
  if (existingIdx >= 0) {
    db.sessions[existingIdx] = session;
  } else {
    db.sessions.push(session);
  }
  writeLocalDb(db);
}

export function findLocalSessionByTokenHash(tokenHash: string): LocalSessionRecord | null {
  const db = readLocalDb();
  return db.sessions.find((s) => s.tokenHash === tokenHash) || null;
}

/**
 * PBKDF2 Password Hashing
 */
export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SALT, 10000, 64, 'sha512').toString('hex');
}

/**
 * Verify Password against Hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  if (hash === 'focient_demo_hash' || hash === 'password123') {
    return password === 'password123' || password === 'focient_demo_hash';
  }

  // Check if hash is bcrypt (from @focient/server)
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    try {
      const bcrypt = require('bcryptjs');
      return bcrypt.compareSync(password, hash);
    } catch {
      // ignore
    }
  }

  // Check PBKDF2 hash (from @focient/web)
  try {
    const computed = hashPassword(password);
    if (computed.length === hash.length) {
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Generate Cryptographically Secure Random Token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash session token for secure database storage
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a new user session in PostgreSQL with file-backed resilience
 */
export async function createSession(userId: string, userAgent = 'Web Browser', ipAddress = '127.0.0.1') {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

  // Always persist session locally so offline dev retains session
  saveSessionToLocalDb({
    token,
    tokenHash,
    userId,
    expiresAt: expiresAt.toISOString(),
    revokedAt: null,
  });

  try {
    await prisma.session.create({
      data: {
        userId,
        tokenHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });
  } catch (error) {
    // Expected when PostgreSQL is offline in local dev mode
    console.warn('Prisma session creation skipped (database might be offline):', error);
  }

  return { token, expiresAt };
}

/**
 * Verify Session Token against database or local persistent DB
 */
export async function verifySession(token: string) {
  if (!token) return { valid: false, user: null };

  const tokenHash = hashToken(token);

  // 1. Try PostgreSQL if available
  try {
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (session) {
      if (session.revokedAt) return { valid: false, user: null, message: 'Sesi telah dicabut' };
      if (new Date() > session.expiresAt) return { valid: false, user: null, message: 'Sesi telah kedaluwarsa' };

      return {
        valid: true,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          roleArchetype: session.user.roleArchetype || '',
          occupancy: session.user.occupancy || session.user.roleArchetype || '',
          workingRhythm: session.user.workingRhythm || '',
          schedulingStyle: session.user.schedulingStyle || '',
          dailyCapacityMinutes: session.user.dailyCapacityMinutes,
          workHourStart: session.user.workHourStart,
          workHourEnd: session.user.workHourEnd,
          startWorkTime: session.user.startWorkTime || session.user.workHourStart,
          endWorkTime: session.user.endWorkTime || session.user.workHourEnd,
          restTimePerTask: session.user.restTimePerTask ?? 10,
          isOnboardingCompleted: session.user.isOnboardingCompleted,
        },
      };
    }
  } catch {
    // PostgreSQL is unreachable; fall through to local storage
  }

  // 2. Check local persistent store
  const localSession = findLocalSessionByTokenHash(tokenHash);
  if (localSession) {
    if (localSession.revokedAt) return { valid: false, user: null, message: 'Sesi telah dicabut' };
    if (new Date() > new Date(localSession.expiresAt)) return { valid: false, user: null, message: 'Sesi telah kedaluwarsa' };

    const localUser = findLocalUserById(localSession.userId);
    if (localUser) {
      return {
        valid: true,
        user: {
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
          roleArchetype: localUser.roleArchetype || '',
          occupancy: localUser.occupancy || localUser.roleArchetype || '',
          workingRhythm: localUser.workingRhythm || '',
          schedulingStyle: localUser.schedulingStyle || '',
          dailyCapacityMinutes: localUser.dailyCapacityMinutes,
          workHourStart: localUser.workHourStart,
          workHourEnd: localUser.workHourEnd,
          startWorkTime: localUser.startWorkTime || localUser.workHourStart,
          endWorkTime: localUser.endWorkTime || localUser.workHourEnd,
          restTimePerTask: localUser.restTimePerTask ?? 10,
          isOnboardingCompleted: localUser.isOnboardingCompleted,
        },
      };
    }
  }

  return { valid: false, user: null, message: 'Sesi tidak ditemukan atau telah kedaluwarsa' };
}

/**
 * Revoke Session in PostgreSQL & Local Store
 */
export async function revokeSession(token: string): Promise<boolean> {
  if (!token) return false;
  const tokenHash = hashToken(token);

  const localSession = findLocalSessionByTokenHash(tokenHash);
  if (localSession) {
    localSession.revokedAt = new Date().toISOString();
    saveSessionToLocalDb(localSession);
  }

  try {
    await prisma.session.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
    return true;
  } catch {
    return Boolean(localSession);
  }
}

/**
 * Extract token from HTTP Request headers or Cookie
 */
export function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/focient_token=([^;]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  return null;
}

export function saveNotificationToLocalDb(notification: LocalNotificationRecord): void {
  const db = readLocalDb();
  const existingIdx = db.notifications.findIndex((n) => n.id === notification.id);
  if (existingIdx >= 0) {
    db.notifications[existingIdx] = { ...db.notifications[existingIdx], ...notification };
  } else {
    db.notifications.unshift(notification);
  }
  writeLocalDb(db);
}

export function getNotificationsFromLocalDb(userId: string): LocalNotificationRecord[] {
  const db = readLocalDb();
  return db.notifications.filter((n) => n.userId === userId);
}

export function markNotificationReadInLocalDb(userId: string, id?: string, readAll?: boolean): boolean {
  const db = readLocalDb();
  let modified = false;
  db.notifications = db.notifications.map((n) => {
    if (n.userId === userId && (readAll || n.id === id)) {
      modified = true;
      return { ...n, isRead: true };
    }
    return n;
  });
  if (modified) writeLocalDb(db);
  return modified;
}

export function deleteNotificationFromLocalDb(userId: string, id: string): boolean {
  const db = readLocalDb();
  const initial = db.notifications.length;
  db.notifications = db.notifications.filter((n) => !(n.id === id && n.userId === userId));
  if (db.notifications.length !== initial) {
    writeLocalDb(db);
    return true;
  }
  return false;
}

