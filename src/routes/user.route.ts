import { Router } from "express";
import * as UserController from "@/controllers/user.controller";
const router = Router();

router.get("/users", UserController.getAllUser);
router.get("/users/:id", UserController.getUsersById);
// router.post("/users", UserController.createUser);
// router.put("/users/:id", UserController.updateUser);
// router.delete("/users/:id", UserController.removeUser);

export default router;
