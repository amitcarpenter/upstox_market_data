"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessTokenAndConnectWebSocket = void 0;
const db_1 = __importDefault(require("../config/db"));
const websocketService_1 = __importDefault(require("../services/websocketService"));
// Function For Restart the Socket when server is starting
const getAccessTokenAndConnectWebSocket = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbConnection = yield (0, db_1.default)();
        const [rows] = yield dbConnection.execute(`
      SELECT access_token
      FROM access_tokens
      ORDER BY created_at DESC
      LIMIT 1
    `);
        if (rows.length === 0) {
            console.log("No Data 0 Length No access token found in the database");
        }
        const accessToken = rows[0].access_token;
        if (accessToken) {
            yield (0, websocketService_1.default)(accessToken);
            yield dbConnection.end();
        }
        else {
            yield dbConnection.end();
            console.log("No access token found in the database");
        }
    }
    catch (error) {
        console.error("Failed to retrieve access token and connect WebSocket:", error);
        throw error;
    }
});
exports.getAccessTokenAndConnectWebSocket = getAccessTokenAndConnectWebSocket;
