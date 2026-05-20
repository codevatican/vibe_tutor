import { Elysia } from "elysia";
import { usersRoutes } from "./routes/users-routes";

const port = process.env.PORT || 3000;

const app = new Elysia()
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .use(usersRoutes)
  .listen(port);

console.log(
  `🦊 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`
);
