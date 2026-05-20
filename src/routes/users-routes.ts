import { Elysia, t } from "elysia";
import { registerUser } from "../services/users-service";

export const usersRoutes = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
    try {
      const result = await registerUser(body.name, body.email, body.password);
      return { data: result };
    } catch (error: any) {
      set.status = 400;
      return { data: error.message };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: "email" }),
      password: t.String(),
    })
  });
