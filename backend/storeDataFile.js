const fs = require('fs');

function saveStockDataToFile(data) {
  const jsonData = JSON.stringify(data);
  fs.writeFile('stocksData.json', jsonData, (err) => {
    if (err) {
      throw new Error('Failed to save stock data to file');
    }
  });
}

function getStockDataFromFile() {
  try {
    const jsonData = fs.readFileSync('stocksData.json', 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    throw new Error('Failed to read stock data from file');
  }
}

module.exports = { saveStockDataToFile, getStockDataFromFile };
