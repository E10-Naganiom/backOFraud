/* eslint-disable prettier/prettier */
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Extrae el salt de un hash bcrypt para guardarlo en DB
 * Formato bcrypt: $2b$12$saltsaltsaltsalt...
 */
export function extractSaltFromBcrypt(hash: string): string {
  // bcrypt hash format: $2b$rounds$salt(22 chars)hash(31 chars)
  // Extraer las primeras 29 caracteres: $2b$12$saltsaltsaltsalt
  if (hash && hash.length >= 29) {
    return hash.substring(0, 29);
  }
  return 'bcrypt'; // Fallback
}
// Mantener funciones antiguas por compatibilidad (marcar como deprecated)
/**
 * @deprecated Usar hashPassword() en su lugar
 */
export function generateSalt(length: number = 16): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

/**
 * @deprecated Usar hashPassword() y comparePassword() en su lugar
 */
export function sha256WithSalt(password: string, salt: string): string {
  const { createHash } = require('crypto');
  return createHash('sha256').update(password + salt).digest('hex');
}