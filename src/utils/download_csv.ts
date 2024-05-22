import axios from "axios";
import fs from "fs";
import path from "path";
import { equity_market_extractAndSaveData } from "./updating_market_data";

const downloadCsvFile = async (
  url: string,
  filePath: string
): Promise<void> => {
  try {
    const response = await axios.get(url, {
      responseType: "stream",
    });
    const fileStream = fs.createWriteStream(filePath);
    response.data.pipe(fileStream);

    return new Promise<void>((resolve, reject) => {
      fileStream.on("finish", () => {
        console.log(`File downloaded successfully to ${filePath}`);
        resolve();
      });
      fileStream.on("error", (error) => {
        console.error("Error downloading file:", error);
        reject(error);
      });
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

const csvUrl =
  "https://archives.nseindia.com/content/indices/ind_nifty50list.csv";
const csvFileName = "ind_nifty50list.csv";
const csvFilePath = path.join(__dirname, "..", "assets", csvFileName);

downloadCsvFile(csvUrl, csvFilePath)
  .then(() => {
    console.log("CSV file downloaded successfully.");
    equity_market_extractAndSaveData(csvFilePath);
  })
  .catch((error) => {
    console.error("Failed to download CSV file:", error);
  });
