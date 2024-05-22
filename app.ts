import express, { Application, Request, Response } from "express";
import connectToDatabase from "./src/config/db";
import configureApp from "./src/config/routes";
import { getAccessTokenAndConnectWebSocket } from "./src/services/restart_websocket";
import "./src/utils/download_csv";
import dotenv from "dotenv";
dotenv.config();

connectToDatabase();
getAccessTokenAndConnectWebSocket();

const app: Application = express();
const PORT = process.env.PORT as string;

configureApp(app);

app.get("/", (req: Request, res: Response) => {
  res.send("Upstox Data Listing");
});

app.listen(PORT, (): void => {
  console.log(`Server is working on ${PORT}`);
});
