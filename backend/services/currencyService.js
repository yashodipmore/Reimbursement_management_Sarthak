const https = require('https');

const fetchJSON = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    }).on('error', reject);
  });
};

// Returns exchange rates for a base currency
const getRates = async (baseCurrency) => {
  const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency.toUpperCase()}`;
  const data = await fetchJSON(url);
  if (!data.rates) throw new Error('Failed to fetch exchange rates');
  return data.rates;
};

// Convert amount from one currency to another
const convertAmount = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return parseFloat(amount);
  }
  const rates = await getRates(fromCurrency);
  const rate = rates[toCurrency.toUpperCase()];
  if (!rate) throw new Error(`No rate found for ${toCurrency}`);
  return parseFloat((amount * rate).toFixed(2));
};

// Get all countries with their currencies
const getCountries = async () => {
  const url = 'https://restcountries.com/v3.1/all?fields=name,currencies';
  const data = await fetchJSON(url);
  return data
    .filter((c) => c.currencies && Object.keys(c.currencies).length > 0)
    .map((c) => ({
      country: c.name.common,
      currencies: Object.entries(c.currencies).map(([code, info]) => ({
        code,
        name: info.name,
        symbol: info.symbol,
      })),
    }))
    .sort((a, b) => a.country.localeCompare(b.country));
};

module.exports = { getRates, convertAmount, getCountries };
