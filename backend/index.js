const WebSocket = require("ws");
const express = require("express");
const axios = require('axios');
const { fetchTopStocksData, assignRefreshIntervals } = require("./polygonApi");
const {
  saveStockDataToFile,
  getStockDataFromFile,
} = require("./storeDataFile");

const app = express();
const PORT = 3001;

const wss = new WebSocket.Server({ port: 8080 });

async function updateStockPricesWithIntervals() {
  try {
    let stocksWithIntervals = await fetchTopStocksData();
    stocksWithIntervals = assignRefreshIntervals(stocksWithIntervals);
    saveStockDataToFile(stocksWithIntervals);
    setInterval(() => {
      stocksWithIntervals.forEach((stock) => {
        const updatedPrice = fetchUpdatedPrice(stock.symbol);
        stock.price = updatedPrice;
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.stocks) {
          const subscribedStocks = stocksWithIntervals.filter((stock) =>
            client.stocks.includes(stock.id)
          );
          client.send(JSON.stringify(subscribedStocks));
        }
      });
    }, 1000);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function fetchUpdatedPrice(stockSymbol) {
  try {
    const apiKey = "l3ZxLn1_oC9JdDv_vKGiJ_nHsb3DhO3A";
    const response = await axios.get(
      `https://api.polygon.io/v2/last/trade/${stockSymbol}&apiKey=${apiKey}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    const topStocks = response.data.p

    return topStocks;
  } catch (error) {
    console.error("Error fetching top stocks:", error);
    throw new Error("Failed to fetch top stocks from Polygon API");
  }
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    const { action, stocks } = JSON.parse(message);

    if (action === "subscribe" && Array.isArray(stocks)) {
      ws.stocks = stocks; 
    }
  });
});

app.get("/stocks/:n", async (req, res) => {
  try {
    const n = parseInt(req.params.n);
    if (n <= 0 || n > 20) {
      return res.status(400).json({ error: "Invalid input for n" });
    }

    const stocksData = getStockDataFromFile(); 

    const stocks = stocksData.slice(0, n);

    res.json(stocks);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  updateStockPricesWithIntervals();
});
