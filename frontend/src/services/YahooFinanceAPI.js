import yahooFinance from 'yahoo-finance2';

export const YahooFinanceAPI = {
  // Get real-time quote data for a single ticker
  getQuote: async (symbol) => {
    try {
      const quote = await yahooFinance.quote(symbol);
      return quote;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  },

  // Get real-time quotes for multiple tickers
  getQuotes: async (symbols) => {
    try {
      const quotes = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const quote = await yahooFinance.quote(symbol);
            return { symbol, quote };
          } catch (error) {
            console.error(`Error fetching quote for ${symbol}:`, error);
            return { symbol, error };
          }
        })
      );
      return quotes;
    } catch (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }
  }
}; 