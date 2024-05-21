import { Router } from "express";
import { login, callback } from "../controllers/authController";

const router = Router();

router.get("/auth/login", login);
router.get("/market_data", callback);


export default router;
