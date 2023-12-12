import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StocksComponent = () => {
  const [n, setN] = useState('');
  const [stocksData, setStocksData] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (n > 0 && n <= 20) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/stocks/${n}`);
          if (response.status === 200) {
            setStocksData(response.data);
            subscribeToUpdates(response.data);
          } else {
            console.error('Failed to fetch stocks:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching stocks:', error.message);
        }
      };
      fetchData();
    }
  }, [n]);

  const subscribeToUpdates = (stocks) => {
    const stockIds = stocks.map((stock) => stock.id);

    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ action: 'subscribe', stocks: stockIds }));
    };
    ws.onmessage = (event) => {
      const updatedStockData = JSON.parse(event.data);
      const updatedStocks = stocksData.map((stock) => {
        const updatedStock = updatedStockData.find((updated) => updated.id === stock.id);
        if (updatedStock) {
          return { ...stock, price: updatedStock.price }; // Update price or any other relevant data
        }
        return stock;
      });
      setStocksData(updatedStocks);
    };
    setSocket(ws);
  };

  const handleNChange = (e) => {
    setN(e.target.value);
  };

  return (
    <div>
      <input type="number" value={n} onChange={handleNChange} min="1" max="20" />
      <ul>
        {stocksData.map((stock) => (
          <li key={stock.id}>{stock.symbol}: {stock.price}</li>
        ))}
      </ul>
    </div>
  );
};

export default StocksComponent;
