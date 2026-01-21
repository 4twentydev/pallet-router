import { eq } from 'drizzle-orm';
import { db, users, type User, type NewUser } from './index';
import { hash, compare } from 'bcryptjs';

/**
 * Hashes a PIN for storage
 */
export async function hashPin(pin: string): Promise<string> {
  return hash(pin, 10);
}

/**
 * Verifies a PIN against a hash
 */
export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  return compare(pin, hashedPin);
}

/**
 * Finds a user by PIN and verifies it
 */
export async function authenticateUser(pin: string): Promise<User | null> {
  console.log('[authenticateUser] Attempting authentication');

  // Get all users (typically there won't be many)
  const allUsers = await db.select().from(users);

  // Check each user's PIN
  for (const user of allUsers) {
    const isValid = await verifyPin(pin, user.pin);
    if (isValid) {
      console.log('[authenticateUser] Authentication successful for user:', user.name);
      return user;
    }
  }

  console.log('[authenticateUser] Authentication failed');
  return null;
}

/**
 * Creates a new user
 */
export async function createUser(name: string, pin: string, role: 'admin' | 'user' = 'user'): Promise<User> {
  const hashedPin = await hashPin(pin);

  const [user] = await db.insert(users).values({
    name,
    pin: hashedPin,
    role,
  }).returning();

  console.log('[createUser] Created user:', user.name, 'with role:', user.role);
  return user;
}

/**
 * Gets all users (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  return db.select().from(users);
}

/**
 * Gets a user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}
