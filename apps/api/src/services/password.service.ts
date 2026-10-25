import bcrypt from "bcryptjs";

/** Cost factor 12 is a common secure default. Raise it as hardware improves. */
const BCRYPT_COST = 12;

let dummyHashPromise: Promise<string> | null = null;

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_COST);
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Runs a bcrypt comparison against a fixed hash. Call this when the account does
 * not exist, so response timing does not reveal which emails are registered.
 */
export async function burnPasswordCheck(plaintext: string): Promise<void> {
  dummyHashPromise ??= bcrypt.hash("timing-equaliser-not-a-real-password", BCRYPT_COST);
  await bcrypt.compare(plaintext, await dummyHashPromise);
}
