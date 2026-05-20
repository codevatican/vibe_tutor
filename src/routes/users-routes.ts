import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../services/users-service";

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
  })
  .post("/login", async ({ body, set }) => {
    try {
      const token = await loginUser(body.email, body.password);
      return {
        data: {
          token
        }
      };
    } catch (error: any) {
      set.status = 400;
      return { data: error.message };
    }
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String(),
    })
  })
  .get("/current", async ({ headers, set }) => {
    const authorization = headers["authorization"];
    if (!authorization || !authorization.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "unauthorized" };
    }

    const token = authorization.substring(7);
    try {
      const user = await getCurrentUser(token);
      return { data: user };
    } catch (error: any) {
      set.status = 401;
      return { error: "unauthorized" };
    }
  });
