"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Upstox Market Data");
});
router.get("/market_data", (req, res) => {
    res.send("login success fully for the market data");
});
router.get("/market_data", (req, res) => {
    res.send("login success fully for the market data");
});
exports.default = router;
