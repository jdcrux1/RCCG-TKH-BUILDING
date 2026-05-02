import bcrypt from 'bcryptjs';

export async function hashPin(pin: string) {
  return await bcrypt.hash(pin, 10);
}

export async function comparePin(pin: string, hashedPin: string) {
  return await bcrypt.compare(pin, hashedPin);
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashed: string) {
  return await bcrypt.compare(password, hashed);
}
