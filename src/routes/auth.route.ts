import { Router } from "express";
const router = Router();
import * as authController from "@/controllers/auth.controller";
import { checkAuth } from "@/middleware/passport";
import validateRequestSchema from "@/middleware/validateRequestSchema";
import {
  changepasswordSchema,
  changepasswordWithCodeSchema,
  loginSchema,
  registerSchema,
  resetPasswordBody,
  resendVerifyBody,
} from "@/validation/user.schema";

router.post("/auth/login", validateRequestSchema(loginSchema), authController.login);
router.post("/auth/register", validateRequestSchema(registerSchema), authController.register);
router.get("/auth/activation/:code?", authController.activeUser);
router.post("/auth/resend/verify", validateRequestSchema(resendVerifyBody), authController.resendEmailForVerify);

router.post("/auth/password/reset", validateRequestSchema(resetPasswordBody), authController.resetPassword);
router.post("/auth/password/new/:code?", validateRequestSchema(changepasswordWithCodeSchema), authController.changePasswordWithCode);

router.get("/auth/profile", checkAuth, authController.userProfile);
router.put("/auth/changeprofile", checkAuth, authController.changeProfile);
router.post("/auth/changepassword", validateRequestSchema(changepasswordSchema), checkAuth, authController.changePassword);

export default router;
