"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cookie_parser_1 = require("cookie-parser");
var authRoutes_1 = require("../routes/authRoutes");
var configureApp = function (app) {
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    app.use("/api", authRoutes_1.default);
};
exports.default = configureApp;
