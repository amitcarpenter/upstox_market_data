// // Import required modules
// const UpstoxClient = require("upstox-js-sdk");
// const WebSocket = require("ws").WebSocket;
// const protobuf = require("protobufjs");
// const {
//   fetchAndFormatData,
//   connectToDatabase,
// } = require("./instument_key_formating");

// // Initialize global variables
// let protobufRoot = null;
// let defaultClient = UpstoxClient.ApiClient.instance;
// let apiVersion = "2.0";
// let OAUTH2 = defaultClient.authentications["OAUTH2"];
// let instrumentKeys;

// // Fetch instrument keys
// (async () => {
//   instrumentKeys = await fetchAndFormatData();
//   console.log(instrumentKeys);
// })();

// // Function to fetch details from the equity_market_top_data table using ISIN
// const fetchDetailsFromISIN = async (isin) => {
//   const connection = await connectToDatabase();
//   const [rows] = await connection.execute(
//     "SELECT Symbol, Company_Name, Industry FROM equity_market_top_data WHERE ISIN_Code = ?",
//     [isin]
//   );
//   await connection.end();
//   if (rows.length > 0) {
//     return rows[0];
//   } else {
//     throw new Error(`No data found for ISIN ${isin}`);
//   }
// };

// // Function to fetch details from nse_fo_data table
// const fetchDetailsFromNseFo = async (instrumentKey) => {
//   const connection = await connectToDatabase();
//   const [rows] = await connection.execute(
//     "SELECT * FROM nse_fo_data WHERE instrument_key = ?",
//     [instrumentKey]
//   );
//   await connection.end();
//   if (rows.length > 0) {
//     return rows[0];
//   } else {
//     throw new Error(`No data found for instrument key ${instrumentKey}`);
//   }
// };

// // Function to fetch details from mcx_fo_data table
// const fetchDetailsFromMcxFo = async (instrumentKey) => {
//   const connection = await connectToDatabase();
//   const [rows] = await connection.execute(
//     "SELECT * FROM mcx_fo_data WHERE instrument_key = ?",
//     [instrumentKey]
//   );
//   await connection.end();
//   if (rows.length > 0) {
//     return rows[0];
//   } else {
//     throw new Error(`No data found for instrument key ${instrumentKey}`);
//   }
// };

// // Function to save data to the database
// const saveToDatabase = async (data) => {
//   if (!data.feeds || Object.keys(data.feeds).length === 0) {
//     console.error("No data available in feeds");
//     return;
//   }

//   const connection = await connectToDatabase();
//   const instrumentKey = Object.keys(data.feeds)[0];
//   const feedData = data.feeds[instrumentKey];
//   const ltpc = JSON.stringify(feedData.ff.marketFF.ltpc);
//   const ohlc = JSON.stringify(feedData.ff.marketFF.marketOHLC.ohlc[0]);
//   const isin = instrumentKey.split("|")[1];
//   const exchange = instrumentKey.split("|")[0];

//   if (exchange === "NSE_EQ") {
//     const { Symbol, Company_Name, Industry } = await fetchDetailsFromISIN(isin);

//     const [rows] = await connection.execute(
//       "SELECT COUNT(*) as count FROM live_feed_data WHERE instrument_key = ?",
//       [instrumentKey]
//     );

//     if (rows[0].count > 0) {
//       const updateQuery = `
//         UPDATE live_feed_data SET
//           exchange = ?,
//           company_name = ?,
//           symbol = ?,
//           industry = ?,
//           ltpc = ?,
//           ohlc = ?
//         WHERE instrument_key = ?
//       `;
//       await connection.execute(updateQuery, [
//         exchange,
//         Company_Name,
//         Symbol,
//         Industry,
//         ltpc,
//         ohlc,
//         instrumentKey,
//       ]);
//     } else {
//       const insertQuery = `
//         INSERT INTO live_feed_data (
//           instrument_key,
//           exchange,
//           company_name,
//           symbol,
//           industry,
//           ltpc,
//           ohlc
//         ) VALUES (?, ?, ?, ?, ?, ?, ?)
//       `;
//       await connection.execute(insertQuery, [
//         instrumentKey,
//         exchange,
//         Company_Name,
//         Symbol,
//         Industry,
//         ltpc,
//         ohlc,
//       ]);
//     }
//   } else if (exchange === "NSE_FO") {
//     const details = await fetchDetailsFromNseFo(instrumentKey);
//     // Process and save NSE_FO data
//     // Similar logic as NSE_EQ can be applied here with necessary adjustments
//   } else if (exchange === "MCX_FO") {
//     const details = await fetchDetailsFromMcxFo(instrumentKey);
//     // Process and save MCX_FO data
//     // Similar logic as NSE_EQ can be applied here with necessary adjustments
//   }

//   await connection.end();
// };

// // Function to authorize the market data feed
// const getMarketFeedUrl = async () => {
//   return new Promise((resolve, reject) => {
//     let apiInstance = new UpstoxClient.WebsocketApi();
//     apiInstance.getMarketDataFeedAuthorize(
//       apiVersion,
//       (error, data, response) => {
//         if (error) reject(error);
//         else resolve(data.data.authorizedRedirectUri);
//       }
//     );
//   });
// };

// // Function to establish WebSocket connection
// const connectWebSocket = async (wsUrl) => {
//   return new Promise((resolve, reject) => {
//     const ws = new WebSocket(wsUrl, {
//       headers: {
//         "Api-Version": apiVersion,
//         Authorization: "Bearer " + OAUTH2.accessToken,
//       },
//       followRedirects: true,
//     });

//     ws.on("open", () => {
//       console.log("connected");
//       resolve(ws);

//       setTimeout(() => {
//         const data = {
//           guid: "someguid",
//           method: "sub",
//           data: {
//             mode: "full",
//             instrumentKeys,
//           },
//         };
//         ws.send(Buffer.from(JSON.stringify(data)));
//       }, 1000);
//     });

//     ws.on("close", () => {
//       console.log("disconnected");
//     });

//     ws.on("message", (data) => {
//       const decodedData = decodeProtobuf(data);
//       if (decodedData) {
//         saveToDatabase(decodedData);
//       }
//     });

//     ws.on("error", (error) => {
//       console.log("error:", error);
//       reject(error);
//     });
//   });
// };

// // Function to initialize the protobuf part
// const initProtobuf = async () => {
//   protobufRoot = await protobuf.load(__dirname + "/MarketDataFeed.proto");
//   console.log("Protobuf part initialization complete");
// };

// // Function to decode protobuf message
// const decodeProtobuf = (buffer) => {
//   if (!protobufRoot) {
//     console.warn("Protobuf part not initialized yet!");
//     return null;
//   }

//   const FeedResponse = protobufRoot.lookupType(
//     "com.upstox.marketdatafeeder.rpc.proto.FeedResponse"
//   );
//   return FeedResponse.decode(buffer);
// };

// // Initialize the protobuf part and establish the WebSocket connection
// const WebSocketService = async (accessToken) => {
//   try {
//     console.log(accessToken);
//     OAUTH2.accessToken = accessToken;
//     await initProtobuf();
//     const wsUrl = await getMarketFeedUrl();
//     const ws = await connectWebSocket(wsUrl);
//   } catch (error) {
//     console.log("update your access code of the upstox");
//     console.error("An error occurred:", error.Authorization);
//   }
// };

// module.exports = WebSocketService;

// Import required modules
const UpstoxClient = require("upstox-js-sdk");
const WebSocket = require("ws").WebSocket;
const protobuf = require("protobufjs");
const {
  fetchAndFormatData,
  connectToDatabase,
} = require("./instument_key_formating");

// Initialize global variables
let protobufRoot = null;
let defaultClient = UpstoxClient.ApiClient.instance;
let apiVersion = "2.0";
let OAUTH2 = defaultClient.authentications["OAUTH2"];
let instrumentKeys;
let dbConnection;

// Fetch instrument keys and establish a database connection
(async () => {
  instrumentKeys = await fetchAndFormatData();
  console.log(instrumentKeys);
  dbConnection = await connectToDatabase();
})();

// Function to fetch details from the equity_market_top_data table using ISIN
const fetchDetailsFromISIN = async (isin) => {
  const [rows] = await dbConnection.execute(
    "SELECT Symbol, Company_Name, Industry FROM equity_market_top_data WHERE ISIN_Code = ?",
    [isin]
  );
  if (rows.length > 0) {
    return rows[0];
  } else {
    throw new Error(`No data found for ISIN ${isin}`);
  }
};

// Function to fetch details from nse_fo_data table
const fetchDetailsFromNseFo = async (instrumentKey) => {
  const [rows] = await dbConnection.execute(
    "SELECT * FROM nse_fo_data WHERE instrument_key = ?",
    [instrumentKey]
  );
  if (rows.length > 0) {
    return rows[0];
  } else {
    throw new Error(`No data found for instrument key ${instrumentKey}`);
  }
};

// Function to fetch details from mcx_fo_data table
const fetchDetailsFromMcxFo = async (instrumentKey) => {
  const [rows] = await dbConnection.execute(
    "SELECT * FROM mcx_fo_data WHERE instrument_key = ?",
    [instrumentKey]
  );
  if (rows.length > 0) {
    return rows[0];
  } else {
    throw new Error(`No data found for instrument key ${instrumentKey}`);
  }
};

// Function to save data to the database
const saveToDatabase = async (data) => {
  if (!data.feeds || Object.keys(data.feeds).length === 0) {
    console.error("No data available in feeds");
    return;
  }

  const instrumentKey = Object.keys(data.feeds)[0];
  const feedData = data.feeds[instrumentKey];
  const ltpc = JSON.stringify(feedData.ff.marketFF.ltpc);
  const ohlc = JSON.stringify(feedData.ff.marketFF.marketOHLC.ohlc[0]);
  const isin = instrumentKey.split("|")[1];
  const exchange = instrumentKey.split("|")[0];
  console.log(exchange);

  if (exchange === "NSE_EQ") {
    const { Symbol, Company_Name, Industry } = await fetchDetailsFromISIN(isin);
    const [rows] = await dbConnection.execute(
      "SELECT COUNT(*) as count FROM live_feed_data WHERE instrument_key = ?",
      [instrumentKey]
    );

    if (rows[0].count > 0) {
      const updateQuery = `
        UPDATE live_feed_data SET
          exchange = ?,
          company_name = ?,
          expiry = ?,
          symbol = ?,
          industry = ?,
          ltpc = ?,
          ohlc = ?
        WHERE instrument_key = ?
      `;
      await dbConnection.execute(updateQuery, [
        exchange,
        Company_Name,
        Symbol,
        expiry,
        Industry,
        ltpc,
        ohlc,
        instrumentKey,
      ]);
    } else {
      const insertQuery = `
        INSERT INTO live_feed_data (
          instrument_key,
          exchange,
          company_name,
          expiry,
          symbol,
          industry,
          ltpc,
          ohlc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await dbConnection.execute(insertQuery, [
        instrumentKey,
        exchange,
        Company_Name,
        Symbol,
        Industry,
        ltpc,
        ohlc,
      ]);
    }
  } else if (exchange === "NSE_FO") {
    const instrumentKey_for_nse_fo = Object.keys(data.feeds)[0];
    const details = await fetchDetailsFromNseFo(instrumentKey_for_nse_fo);
    // console.log(details);

    const process_company_name = (tradingsymbol) => {
      const regex = /(\d+)/;
      const parts = tradingsymbol.split(regex);
      if (parts.length > 1) {
        return parts[0].toLowerCase();
      }
      return tradingsymbol.toLowerCase();
    };

    const instrumentKey = details.instrument_key;
    const exchange = details.exchange;
    const Symbol = details.tradingsymbol;
    const Company_Name = await process_company_name(Symbol);
    const Industry = null;
    const expiry = details.expiry;
    const [rows] = await dbConnection.execute(
      "SELECT COUNT(*) as count FROM live_feed_data WHERE instrument_key = ?",
      [instrumentKey]
    );

    if (rows[0].count > 0) {
      const updateQuery = `
        UPDATE live_feed_data SET
          exchange = ?,
          company_name = ?,
          expiry = ?,
          symbol = ?,
          industry = ?,
          ltpc = ?,
          ohlc = ?
        WHERE instrument_key = ?
      `;
      await dbConnection.execute(updateQuery, [
        exchange,
        Company_Name,
        Symbol,
        expiry,
        Industry,
        ltpc,
        ohlc,
        instrumentKey,
      ]);
    } else {
      const insertQuery = `
        INSERT INTO live_feed_data (
          instrument_key,
          exchange,
          company_name,
          expiry,
          symbol,
          industry,
          ltpc,
          ohlc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await dbConnection.execute(insertQuery, [
        instrumentKey,
        exchange,
        Company_Name,
        Symbol,
        Industry,
        ltpc,
        ohlc,
      ]);
    }
  } else if (exchange === "MCX_FO") {
    const instrumentKey_for_mcx_fo = Object.keys(data.feeds)[0];
    const details = await fetchDetailsFromMcxFo(instrumentKey_for_mcx_fo);
    console.log(details);

    const instrumentKey = details.instrument_key;
    const exchange = details.exchange;
    const Symbol = details.tradingsymbol;
    const Company_Name = details.name;
    const expiry = details.expiry;

    const Industry = null;

    const [rows] = await dbConnection.execute(
      "SELECT COUNT(*) as count FROM live_feed_data WHERE instrument_key = ?",
      [instrumentKey]
    );

    if (rows[0].count > 0) {
      const updateQuery = `
        UPDATE live_feed_data SET
          exchange = ?,
          company_name = ?,
          expiry = ?,
          symbol = ?,
          industry = ?,
          ltpc = ?,
          ohlc = ?
        WHERE instrument_key = ?
      `;
      await dbConnection.execute(updateQuery, [
        exchange,
        Company_Name,
        Symbol,
        expiry,
        Industry,
        ltpc,
        ohlc,
        instrumentKey,
      ]);
    } else {
      const insertQuery = `
        INSERT INTO live_feed_data (
          instrument_key,
          exchange,
          company_name,
          expiry,
          symbol,
          industry,
          ltpc,
          ohlc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await dbConnection.execute(insertQuery, [
        instrumentKey,
        exchange,
        Company_Name,
        Symbol,
        Industry,
        ltpc,
        ohlc,
      ]);
    }
  }
};

// Function to authorize the market data feed
const getMarketFeedUrl = async () => {
  return new Promise((resolve, reject) => {
    let apiInstance = new UpstoxClient.WebsocketApi();
    apiInstance.getMarketDataFeedAuthorize(
      apiVersion,
      (error, data, response) => {
        if (error) reject(error);
        else resolve(data.data.authorizedRedirectUri);
      }
    );
  });
};

// Function to establish WebSocket connection
const connectWebSocket = async (wsUrl) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl, {
      headers: {
        "Api-Version": apiVersion,
        Authorization: "Bearer " + OAUTH2.accessToken,
      },
      followRedirects: true,
    });

    ws.on("open", () => {
      console.log("connected");
      resolve(ws);

      setTimeout(() => {
        const data = {
          guid: "someguid",
          method: "sub",
          data: {
            mode: "full",
            instrumentKeys,
          },
        };
        ws.send(Buffer.from(JSON.stringify(data)));
      }, 1000);
    });

    ws.on("close", () => {
      console.log("disconnected");
    });

    ws.on("message", (data) => {
      const decodedData = decodeProtobuf(data);
      if (decodedData) {
        saveToDatabase(decodedData);
      }
    });

    ws.on("error", (error) => {
      console.log("error:", error);
      reject(error);
    });
  });
};

// Function to initialize the protobuf part
const initProtobuf = async () => {
  protobufRoot = await protobuf.load(__dirname + "/MarketDataFeed.proto");
  console.log("Protobuf part initialization complete");
};

// Function to decode protobuf message
const decodeProtobuf = (buffer) => {
  if (!protobufRoot) {
    console.warn("Protobuf part not initialized yet!");
    return null;
  }

  const FeedResponse = protobufRoot.lookupType(
    "com.upstox.marketdatafeeder.rpc.proto.FeedResponse"
  );
  return FeedResponse.decode(buffer);
};

// Initialize the protobuf part and establish the WebSocket connection
const WebSocketService = async (accessToken) => {
  try {
    console.log(accessToken);
    OAUTH2.accessToken = accessToken;
    await initProtobuf();
    const wsUrl = await getMarketFeedUrl();
    const ws = await connectWebSocket(wsUrl);
  } catch (error) {
    console.log("update your access code of the upstox");
    console.error("An error occurred:", error.Authorization);
  }
};

// Close the database connection when the application terminates
const closeDatabaseConnection = async () => {
  if (dbConnection) {
    await dbConnection.end();
  }
};

process.on("exit", closeDatabaseConnection);
process.on("SIGINT", closeDatabaseConnection);
process.on("SIGTERM", closeDatabaseConnection);

module.exports = WebSocketService;
