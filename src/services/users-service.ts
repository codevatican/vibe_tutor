import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function registerUser(name: string, email: string, passwordString: string) {
  // 1. Cek apakah email sudah terdaftar
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    throw new Error("email sudah terdaftar");
  }

  // 2. Hash password menggunakan bcrypt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(passwordString, salt);

  // 3. Simpan user ke database
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return "OK";
}
