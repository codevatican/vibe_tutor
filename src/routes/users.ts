import { Elysia, t } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("/", async () => {
    try {
      const allUsers = await db.select().from(users);
      return { success: true, data: allUsers };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:id", async ({ params: { id } }) => {
    try {
      const userList = await db.select().from(users).where(eq(users.id, Number(id)));
      if (userList.length === 0) {
        return { success: false, message: "User not found" };
      }
      return { success: true, data: userList[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/", async ({ body }) => {
    try {
      const result = await db.insert(users).values({
        name: body.name,
        email: body.email,
      });
      return { success: true, message: "User created successfully", data: { id: result[0].insertId } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: "email" }),
    })
  })
  .put("/:id", async ({ params: { id }, body }) => {
    try {
      await db.update(users)
        .set({
          name: body.name,
          email: body.email,
        })
        .where(eq(users.id, Number(id)));
      return { success: true, message: "User updated successfully" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      email: t.Optional(t.String({ format: "email" })),
    })
  })
  .delete("/:id", async ({ params: { id } }) => {
    try {
      await db.delete(users).where(eq(users.id, Number(id)));
      return { success: true, message: "User deleted successfully" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
