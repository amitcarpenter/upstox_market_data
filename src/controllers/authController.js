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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callback = exports.login = void 0;
var axios_1 = require("axios");
var qs_1 = require("qs");
var websocketService_1 = require("../services/websocketService");
var dotenv_1 = require("dotenv");
var db_1 = require("../config/db");
dotenv_1.default.config();
var CLIENT_ID = process.env.UPSTOX_API_KEY;
var REDIRECT_URI = process.env.UPSTOX_REDIRECT_URI;
var CLIENT_SECRET = process.env.UPSTOX_API_SECRET;
var login = function (req, res) {
    var authUrl = "https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=".concat(CLIENT_ID, "&redirect_uri=").concat(encodeURIComponent(REDIRECT_URI));
    res.redirect(authUrl);
};
exports.login = login;
var callback = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, code, state, response, _b, access_token, refresh_token, dbConnection, insertQuery, ws, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.query, code = _a.code, state = _a.state;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 7, , 8]);
                return [4 /*yield*/, axios_1.default.post("https://api.upstox.com/v2/login/authorization/token", qs_1.default.stringify({
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        grant_type: "authorization_code",
                        code: code,
                        redirect_uri: REDIRECT_URI,
                    }), {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    })];
            case 2:
                response = _c.sent();
                _b = response.data, access_token = _b.access_token, refresh_token = _b.refresh_token;
                console.log(response.data);
                return [4 /*yield*/, (0, db_1.default)()];
            case 3:
                dbConnection = _c.sent();
                insertQuery = "\n      INSERT INTO access_tokens (access_token)\n      VALUES (?)\n    ";
                return [4 /*yield*/, dbConnection.execute(insertQuery, [access_token])];
            case 4:
                _c.sent();
                return [4 /*yield*/, dbConnection.end()];
            case 5:
                _c.sent();
                return [4 /*yield*/, (0, websocketService_1.default)(access_token)];
            case 6:
                ws = _c.sent();
                res.json({
                    access_token: access_token,
                    refresh_token: refresh_token,
                });
                return [3 /*break*/, 8];
            case 7:
                error_1 = _c.sent();
                console.log(error_1);
                res.status(500).json({ error: "Failed to fetch tokens" });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.callback = callback;
