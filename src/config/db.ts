import { createConnection, Connection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
}

const dbConfig: DbConfig = {
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_DATABASE as string,
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
