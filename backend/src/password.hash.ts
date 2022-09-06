import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export class password
{
  static async hash (password: string): Promise<string>
  {
    const salt = randomBytes(16).toString('hex');
    const buf = scryptSync(password, salt, 64) as Buffer;
    return `${buf.toString('hex')}:${salt}`;
  }

  static async compare (dbPassword: string, suppliedPassword: string): Promise<boolean>
  {
    const [hashedPassword, salt] = dbPassword.split(':');
    const bufferKey = Buffer.from(hashedPassword, 'hex');
    const derivedKey = scryptSync(suppliedPassword, salt, 64);
    return timingSafeEqual(bufferKey, derivedKey);
  }
}
