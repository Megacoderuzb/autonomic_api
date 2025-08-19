import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string | number): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password.toString(), saltRounds);
}

export async function comparePassword(
  plainPassword: string | number,
  hashedPassword: string | number,
): Promise<boolean> {
  return await bcrypt.compare(
    plainPassword.toString(),
    hashedPassword.toString(),
  );
}
