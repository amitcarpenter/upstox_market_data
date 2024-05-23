const mysql = require("mysql2/promise");
require("dotenv").config();


const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_DATABASE || "upstox_market_data",
};

const connectToDatabase = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Connected to the MySQL database1");
    return connection;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};


const fetchAndFormatData = async () => {
  try {
    const connection = await connectToDatabase();

    // Fetch data from the equity_market_top_data table
    const [equityRows] = await connection.execute(
      "SELECT Symbol, `ISIN_Code` FROM equity_market_top_data"
    );
    const equityFormattedData = equityRows.map(
      (row) => `NSE_EQ|${row["ISIN_Code"]}`
    );

    // Fetch data from the mcx_fo_data table
    const [mcxRows] = await connection.execute(
      "SELECT instrument_key FROM mcx_fo_data LIMIT 20"
    );
    const mcxFormattedData = mcxRows.map((row) => row.instrument_key);

    // Fetch data from the nse_fo_data table
    const [nseRows] = await connection.execute(
      "SELECT instrument_key FROM nse_fo_data LIMIT 20"
    );
    const nseFormattedData = nseRows.map((row) => row.instrument_key);

    // Combine all formatted data
    const formattedData = [
      ...equityFormattedData,
      ...mcxFormattedData,
      ...nseFormattedData,
    ];

    await connection.end();
    return formattedData;
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    throw error;
  }
};

module.exports = fetchAndFormatData;
