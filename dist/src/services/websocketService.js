// Import required modules
var UpstoxClient = require("upstox-js-sdk");
const WebSocket = require("ws").WebSocket;
const protobuf = require("protobufjs");
const fetchAndFormatData = require("./instument_key_formating");

var instrumentKeys;
// setInterval(() => {
  (async () => {
    instrumentKeys = await fetchAndFormatData();
    console.log(instrumentKeys);
  })();
// }, 10000);

// Initialize global variables
let protobufRoot = null;
let defaultClient = UpstoxClient.ApiClient.instance;
let apiVersion = "2.0";
let OAUTH2 = defaultClient.authentications["OAUTH2"];

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
      console.log(JSON.stringify(decodeProfobuf(data)));
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
const decodeProfobuf = (buffer) => {
  if (!protobufRoot) {
    console.warn("Protobuf part not initialized yet!");
    return null;
  }

  const FeedResponse = protobufRoot.lookupType(
    "com.upstox.marketdatafeeder.rpc.proto.FeedResponse"
  );
  return FeedResponse.decode(buffer);
};

//  Initialize the protobuf part and establish the WebSocket connection
const WebSocketService = async (accessToken) => {
  try {
    console.log(accessToken);
    OAUTH2.accessToken = accessToken;
    console.log(accessToken)
    await initProtobuf();
    const wsUrl = await getMarketFeedUrl();
    const ws = await connectWebSocket(wsUrl);
  } catch (error) {
    console.log("update you access code of the upstox");
    console.error("An error occurred:", error.Authorization);
  }
};

module.exports = WebSocketService;
