import { db } from "../db";
import { users, sessions } from "../db/schema";
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

export async function loginUser(email: string, passwordString: string) {
  // 1. Cari user berdasarkan email
  const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (userList.length === 0) {
    throw new Error("Email atau password salah");
  }

  const user = userList[0]!;

  // 2. Verifikasi password dengan bcrypt
  const isPasswordMatch = await bcrypt.compare(passwordString, user.password);
  if (!isPasswordMatch) {
    throw new Error("Email atau password salah");
  }

  // 3. Generate token UUID
  const token = crypto.randomUUID();

  // 4. Simpan sesi ke database
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
}

export async function getCurrentUser(token: string) {
  // 1. Lakukan join sessions dan users berdasarkan userId
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (result.length === 0) {
    throw new Error("unauthorized");
  }

  const currentUser = result[0]!;

  // 2. Format Date menjadi YYYY-MM-DD HH:mm:ss
  let formattedDate = "";
  if (currentUser.createdAt instanceof Date) {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const d = currentUser.createdAt;
    formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } else if (currentUser.createdAt) {
    formattedDate = String(currentUser.createdAt);
  }

  return {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    createdAt: formattedDate,
  };
}
