"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./src/config/db"));
const routes_1 = __importDefault(require("./src/config/routes"));
const restart_websocket_1 = require("./src/services/restart_websocket");
require("./src/utils/download_csv");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
(0, db_1.default)();
(0, restart_websocket_1.getAccessTokenAndConnectWebSocket)();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
(0, routes_1.default)(app);
app.get("/", (req, res) => {
    res.send("Upstox Data Listing");
});
app.listen(PORT, () => {
    console.log(`Server is working on ${PORT}`);
});
