const axios = require('axios');

async function fetchTopStocksData() {
  try {
    const apiKey = 'l3ZxLn1_oC9JdDv_vKGiJ_nHsb3DhO3A';
    const response = await axios.get(
    `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/2023-11-09?adjusted=true&apiKey=${apiKey}`,{
    headers: {
        "Authorization":`Bearer ${apiKey}`,
        "Content-Type":"application/json"
    }}
    );
    const topStocks = response.data.results.slice(0, 20).map((stock) => ({
      Tred: stock.T,
      openPrice: stock.o,
      refreshInterval: Math.floor(Math.random() * 5) + 1, 
     
    }));

    return topStocks;
  } catch (error) {
    console.error('Error fetching top stocks:', error);
    throw new Error('Failed to fetch top stocks from Polygon API');
  }
}
function assignRefreshIntervals(stocks) {
    return stocks.map((stock, index) => ({
      ...stock,
      refreshInterval: (index + 1) % 5 + 1, 
    }));
  }

module.exports = { fetchTopStocksData ,assignRefreshIntervals };
