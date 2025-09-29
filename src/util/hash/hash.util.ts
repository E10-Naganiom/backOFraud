import { createHash } from 'crypto';
import * as crypto from 'crypto';

export function generateSalt(length: number = 16): string {
    return crypto.randomBytes(length).toString('hex');
}

export const sha256WithSalt = (password: string, salt: string) => {
    return createHash('sha256').update(password + salt).digest('hex');
};