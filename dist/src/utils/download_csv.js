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
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const updating_market_data_1 = require("./updating_market_data");
const downloadCsvFile = (url, filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(url, {
            responseType: "stream",
        });
        const fileStream = fs_1.default.createWriteStream(filePath);
        response.data.pipe(fileStream);
        return new Promise((resolve, reject) => {
            fileStream.on("finish", () => {
                console.log(`File downloaded successfully to ${filePath}`);
                resolve();
            });
            fileStream.on("error", (error) => {
                console.error("Error downloading file:", error);
                reject(error);
            });
        });
    }
    catch (error) {
        console.error("Error downloading file:", error);
        throw error;
    }
});
const csvUrl = "https://archives.nseindia.com/content/indices/ind_nifty50list.csv";
const csvFileName = "ind_nifty50list.csv";
const csvFilePath = path_1.default.join(__dirname, "..", "assets", csvFileName);
downloadCsvFile(csvUrl, csvFilePath)
    .then(() => {
    console.log("CSV file downloaded successfully.");
    (0, updating_market_data_1.equity_market_extractAndSaveData)(csvFilePath);
})
    .catch((error) => {
    console.error("Failed to download CSV file:", error);
});
