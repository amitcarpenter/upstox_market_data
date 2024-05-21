"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authController_1 = require("../controllers/authController");
var router = (0, express_1.Router)();
router.get("/auth/login", authController_1.login);
router.get("/market_data", authController_1.callback);
exports.default = router;
