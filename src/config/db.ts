import { createConnection, Connection } from "mysql2/promise";

interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
}

const dbConfig: DbConfig = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "upstox_market_data",
};

const connectToDatabase = async (): Promise<Connection> => {
  try {
    const connection = await createConnection(dbConfig);
    console.log("Connected to the Mysql database");
    return connection;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};

export default connectToDatabase;
