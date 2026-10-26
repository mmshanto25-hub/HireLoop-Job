import { Router } from "express";
import type { Env } from "../config/env.js";
import { createNotificationController } from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.js";

export function createNotificationRouter(deps: { env: Env }): Router {
  const router = Router();
  const c = createNotificationController();

  router.use(requireAuth(deps.env));

  router.get("/", c.list);
  router.get("/unread-count", c.unreadCount);
  router.patch("/:notificationId/read", c.markAsRead);
  router.post("/read-all", c.markAllAsRead);

  return router;
}

