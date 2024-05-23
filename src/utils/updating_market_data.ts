import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import connectToDatabase from "../config/db";

// Define an interface for the CSV row
interface CsvRow {
  instrument_key: string;
  exchange_token: string;
  tradingsymbol: string;
  name: string;
  last_price: string;
  expiry: string;
  strike: string;
  tick_size: string;
  lot_size: string;
  instrument_type: string;
  option_type: string;
  exchange: string;
}

interface CsvRow {
  exchange: string;
  [key: string]: string;
}

// Function for the downlaod csv file for the NSE_EQ
export const equity_market_extractAndSaveData = async (filePath: string) => {
  try {
    const dbConnection = await connectToDatabase();
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", async (row) => {
        try {
          await dbConnection.execute(
            `INSERT INTO equity_market_top_data 
              (Company_Name, Industry, Symbol, Series, ISIN_Code) 
              VALUES (?, ?, ?, ?, ?) 
              ON DUPLICATE KEY UPDATE 
              Industry = VALUES(Industry), 
              Symbol = VALUES(Symbol), 
              Series = VALUES(Series), 
              ISIN_Code = VALUES(ISIN_Code)`,
            [
              row["Company Name"],
              row["Industry"],
              row["Symbol"],
              row["Series"],
              row["ISIN Code"],
            ]
          );
        } catch (error) {
          console.error("Error saving data to database:", error);
        }
      })
      .on("end", () => {
        console.log("Data extraction and saving completed");
        dbConnection.end();
      });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

const extractAndSaveData = async (
  filePath: string,
  exchangeFilter: string,
  tableName: string
) => {
  try {
    const connection = await connectToDatabase();
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", async (row: CsvRow) => {
        if (row.exchange === exchangeFilter) {
          try {
            await connection.execute(
              `INSERT INTO ${tableName} (
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
                exchange = VALUES(exchange)`,
              [
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
              ]
            );
          } catch (error) {
            console.error("Error saving data to database:", error);
          }
        }
      })
      .on("end", () => {
        console.log("Data extraction and saving completed");
        connection.end();
      })
      .on("error", (error) => {
        console.error("Error reading CSV file:", error);
      });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

const csvFilePathNEw = "../assets/complete.csv";
const csvFilePath = path.join(__dirname, csvFilePathNEw);

export const insert_nse_fo_and_mcx_fo = async () => {
  try {
    await extractAndSaveData(csvFilePath, "NSE_FO", "nse_fo_data");
    await extractAndSaveData(csvFilePath, "MCX_FO", "mcx_fo_data");
  } catch (error) {
    console.error("Error:", error);
  }
};

insert_nse_fo_and_mcx_fo();
