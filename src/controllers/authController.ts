import { Request, Response } from "express";
import axios from "axios";
import qs from "qs";
import WebSocketService from "../services/websocketService";
import dotenv from "dotenv";
import connectToDatabase from "../config/db";
dotenv.config();

const CLIENT_ID = process.env.UPSTOX_API_KEY as string;
const REDIRECT_URI = process.env.UPSTOX_REDIRECT_URI as string;
const CLIENT_SECRET = process.env.UPSTOX_API_SECRET as string;

export const login = (req: Request, res: Response) => {
  const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}`;
  res.redirect(authUrl);
};

export const callback = async (req: Request, res: Response) => {
  const { code, state } = req.query;

  try {
    const response = await axios.post(
      "https://api.upstox.com/v2/login/authorization/token",
      qs.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token } = response.data;
    console.log(response.data);

    const dbConnection = await connectToDatabase();
    const insertQuery = `
      INSERT INTO access_tokens (access_token)
      VALUES (?)
    `;
    await dbConnection.execute(insertQuery, [access_token]);
    await dbConnection.end();

    const ws = await WebSocketService(access_token);
    res.json({
      access_token,
      refresh_token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch tokens" });
  }
};
