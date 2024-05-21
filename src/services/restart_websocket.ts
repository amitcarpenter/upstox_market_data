import connectToDatabase from "../config/db";
import WebSocketService from "../services/websocketService";

// Function For Restart the Socket when server is starting
export const getAccessTokenAndConnectWebSocket = async (): Promise<void> => {
  try {
    const dbConnection = await connectToDatabase();
    const [rows]: any = await dbConnection.execute(`
      SELECT access_token
      FROM access_tokens
      ORDER BY created_at DESC
      LIMIT 1
    `);
    if (rows.length === 0) {
      console.log("No Data 0 Length No access token found in the database");
    }

    const accessToken = rows[0].access_token;
    if (accessToken) {
      await WebSocketService(accessToken);
      await dbConnection.end();
    } else {
        await dbConnection.end();
      console.log("No access token found in the database");
    }
  } catch (error) {
    console.error(
      "Failed to retrieve access token and connect WebSocket:",
      error
    );
    throw error;
  }
};
