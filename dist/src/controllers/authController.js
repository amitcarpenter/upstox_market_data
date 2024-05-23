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
exports.callback = exports.login = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const websocketService_1 = __importDefault(require("../services/websocketService"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("../config/db"));
dotenv_1.default.config();
const CLIENT_ID = process.env.UPSTOX_API_KEY;
const REDIRECT_URI = process.env.UPSTOX_REDIRECT_URI;
const CLIENT_SECRET = process.env.UPSTOX_API_SECRET;
const login = (req, res) => {
    const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    res.redirect(authUrl);
};
exports.login = login;
const callback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, state } = req.query;
    try {
        const response = yield axios_1.default.post("https://api.upstox.com/v2/login/authorization/token", qs_1.default.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: REDIRECT_URI,
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const { access_token, refresh_token } = response.data;
        console.log(response.data);
        const dbConnection = yield (0, db_1.default)();
        const insertQuery = `
      INSERT INTO access_tokens (access_token)
      VALUES (?)
    `;
        yield dbConnection.execute(insertQuery, [access_token]);
        yield dbConnection.end();
        const ws = yield (0, websocketService_1.default)(access_token);
        res.json({
            access_token,
            refresh_token,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch tokens" });
    }
});
exports.callback = callback;
