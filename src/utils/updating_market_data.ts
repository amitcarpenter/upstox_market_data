import fs from "fs";
import csvParser from "csv-parser";
import connectToDatabase from "../config/db";

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


