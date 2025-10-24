/* eslint-disable prettier/prettier */
import * as bcrypt from 'bcrypt';

// Número de rondas de hashing (10-12 es recomendado, mayor = más seguro pero más lento)
const SALT_ROUNDS = 12;

/**
 * Hashea una contraseña usando bcrypt
 * @param password Contraseña en texto plano
 * @returns Hash de la contraseña (incluye la salt automáticamente)
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano con un hash
 * @param password Contraseña en texto plano
 * @param hash Hash almacenado en la base de datos
 * @returns true si coinciden, false si no
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * @deprecated Usar hashPassword() y comparePassword() en su lugar
 */
export function sha256WithSalt(password: string, salt: string): string {
  const { createHash } = require('crypto');
  return createHash('sha256').update(password + salt).digest('hex');
}