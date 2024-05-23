"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.get("/auth/login", authController_1.login);
router.get("/market_data", authController_1.callback);
exports.default = router;
