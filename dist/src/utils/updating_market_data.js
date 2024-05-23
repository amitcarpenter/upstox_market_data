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
exports.insert_nse_fo_and_mcx_fo = exports.equity_market_extractAndSaveData = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const db_1 = __importDefault(require("../config/db"));
// Function for the downlaod csv file for the NSE_EQ
const equity_market_extractAndSaveData = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbConnection = yield (0, db_1.default)();
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on("data", (row) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield dbConnection.execute(`INSERT INTO equity_market_top_data 
              (Company_Name, Industry, Symbol, Series, ISIN_Code) 
              VALUES (?, ?, ?, ?, ?) 
              ON DUPLICATE KEY UPDATE 
              Industry = VALUES(Industry), 
              Symbol = VALUES(Symbol), 
              Series = VALUES(Series), 
              ISIN_Code = VALUES(ISIN_Code)`, [
                    row["Company Name"],
                    row["Industry"],
                    row["Symbol"],
                    row["Series"],
                    row["ISIN Code"],
                ]);
            }
            catch (error) {
                console.error("Error saving data to database:", error);
            }
        }))
            .on("end", () => {
            console.log("Data extraction and saving completed");
            dbConnection.end();
        });
    }
    catch (error) {
        console.error("Error connecting to the database:", error);
    }
});
exports.equity_market_extractAndSaveData = equity_market_extractAndSaveData;
const extractAndSaveData = (filePath, exchangeFilter, tableName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield (0, db_1.default)();
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on("data", (row) => __awaiter(void 0, void 0, void 0, function* () {
            if (row.exchange === exchangeFilter) {
                try {
                    yield connection.execute(`INSERT INTO ${tableName} (
                instrument_key,
                exchange_token,
                tradingsymbol,
                name,
                last_price,
                expiry,
                strike,
                tick_size,
                lot_size,
                instrument_type,
                option_type,
                exchange
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                exchange_token = VALUES(exchange_token),
                tradingsymbol = VALUES(tradingsymbol),
                name = VALUES(name),
                last_price = VALUES(last_price),
                expiry = VALUES(expiry),
                strike = VALUES(strike),
                tick_size = VALUES(tick_size),
                lot_size = VALUES(lot_size),
                instrument_type = VALUES(instrument_type),
                option_type = VALUES(option_type),
                exchange = VALUES(exchange)`, [
                        row.instrument_key,
                        row.exchange_token,
                        row.tradingsymbol,
                        row.name,
                        parseFloat(row.last_price),
                        row.expiry,
                        parseFloat(row.strike),
                        parseFloat(row.tick_size),
                        parseInt(row.lot_size, 10),
                        row.instrument_type,
                        row.option_type,
                        row.exchange,
                    ]);
                }
                catch (error) {
                    console.error("Error saving data to database:", error);
                }
            }
        }))
            .on("end", () => {
            console.log("Data extraction and saving completed");
            connection.end();
        })
            .on("error", (error) => {
            console.error("Error reading CSV file:", error);
        });
    }
    catch (error) {
        console.error("Error connecting to the database:", error);
    }
});
const csvFilePathNEw = "../assets/complete.csv";
const csvFilePath = path_1.default.join(__dirname, csvFilePathNEw);
const insert_nse_fo_and_mcx_fo = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield extractAndSaveData(csvFilePath, "NSE_FO", "nse_fo_data");
        yield extractAndSaveData(csvFilePath, "MCX_FO", "mcx_fo_data");
    }
    catch (error) {
        console.error("Error:", error);
    }
});
exports.insert_nse_fo_and_mcx_fo = insert_nse_fo_and_mcx_fo;
// (0, exports.insert_nse_fo_and_mcx_fo)();
