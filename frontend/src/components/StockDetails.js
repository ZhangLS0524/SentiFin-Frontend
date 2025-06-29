import React, { useState, useEffect } from 'react';
import '../styles/StockDetails.css';
import { TickerAPI } from '../services/TickerAPI';

const StockDetails = ({ ticker }) => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ticker) {
      fetchStockData();
    }
  }, [ticker]);

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TickerAPI.getStockInfo(ticker);
      // Map API metrics to expected structure
      const m = data.metrics || {};
      const mappedData = {
        regularMarketPrice: m.current_price,
        marketCap: m.market_cap,
        trailingPE: m.pe_ratio,
        dividendYield: m.dividend_yield ? m.dividend_yield / 100 : null, // convert percent to decimal
        fiftyTwoWeekHigh: m['52_week_high'],
        fiftyTwoWeekLow: m['52_week_low'],
        regularMarketChange: m.day_change,
        regularMarketChangePercent: m.day_change, // or use a correct field if available
        regularMarketVolume: m.volume,
        averageVolume: m.avg_volume,
        beta: m.beta,
        regularMarketOpen: m.open_price,
        regularMarketPreviousClose: m.prev_close,
        regularMarketDayHigh: m.day_high,
        regularMarketDayLow: m.day_low,
        forwardPE: m.forward_pe,
        pegRatio: m.peg_ratio,
        priceToBook: m.price_to_book,
        marketState: 'REGULAR', // or set based on your API if available
      };
      setStockData(mappedData);
    } catch (err) {
      setError('Failed to fetch stock data');
      console.error('Error fetching stock data:', err); 
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getChangeColor = (change) => {
    if (!change) return '#666';
    return change > 0 ? '#2ecc40' : '#e74c3c';
  };

  const getPEGColor = (pegRatio) => {
    if (!pegRatio) return '#666';
    if (pegRatio < 1.0) return '#2ecc40'; // Green - undervalued
    if (pegRatio <= 2.0) return '#f39c12'; // Orange - fair value
    return '#e74c3c'; // Red - overvalued
  };

  const getForwardPEColor = (forwardPE, trailingPE) => {
    if (!forwardPE || !trailingPE) return '#666';
    // Green if forward P/E is lower than trailing P/E (improving earnings)
    if (forwardPE < trailingPE) return '#2ecc40';
    // Red if forward P/E is higher than trailing P/E (declining earnings)
    if (forwardPE > trailingPE) return '#e74c3c';
    return '#f39c12'; // Orange if they're similar
  };


  return (
    <div className="stock-details-container">
      <div className="stock-details-header">
        <h3>Stock Details</h3>
      </div>
      
      {loading && (
        <div className="stock-details-loading">
          <div className="loading-spinner"></div>
          <p>Loading stock data...</p>
        </div>
      )}

      {error && (
        <div className="stock-details-error">
          <p>{error}</p>
          <button onClick={fetchStockData}>Retry</button>
        </div>
      )}

      {stockData && !loading && !error && (
        <div className="stock-details-content">
          <div className="stock-price-section">
            <div className="current-price">
              <span className="price">{formatCurrency(stockData.regularMarketPrice)}</span>
              <span 
                className="change"
                style={{ color: getChangeColor(stockData.regularMarketChange) }}
              >
                {formatCurrency(stockData.regularMarketChange)} ({formatPercentage(stockData.regularMarketChangePercent)})
              </span>
            </div>
            <div className="market-info">
              <span className="market-status">
                {stockData.marketState === 'REGULAR' ? 'Market Open' : 'Market Closed'}
              </span>
            </div>
          </div>

          <div className="stock-metrics">
            <div className="metric-row">
              <span className="metric-label">Previous Close:</span>
              <span className="metric-value">{formatCurrency(stockData.regularMarketPreviousClose)}</span>
            </div>
            
            <div className="metric-row">
              <span className="metric-label">Open:</span>
              <span className="metric-value">{formatCurrency(stockData.regularMarketOpen)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Day Range:</span>
              <span className="metric-value">
                {formatCurrency(stockData.regularMarketDayLow)} - {formatCurrency(stockData.regularMarketDayHigh)}
              </span>
            </div>

            <div className="metric-row">
              <span className="metric-label">52 Week Range:</span>
              <span className="metric-value">
                {formatCurrency(stockData.fiftyTwoWeekLow)} - {formatCurrency(stockData.fiftyTwoWeekHigh)}
              </span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Volume:</span>
              <span className="metric-value">{formatNumber(stockData.regularMarketVolume)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Avg Volume:</span>
              <span className="metric-value">{formatNumber(stockData.averageVolume)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Market Cap:</span>
              <span className="metric-value">
                {stockData.marketCap ? `$${(stockData.marketCap / 1e9).toFixed(2)}B` : 'N/A'}
              </span>
            </div>

            <div className="metric-row">
              <span className="metric-label">P/E Ratio:</span>
              <span className="metric-value">{stockData.trailingPE ? stockData.trailingPE.toFixed(2) : 'N/A'}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Forward P/E:</span>
              <span 
                className="metric-value" 
                style={{ color: getForwardPEColor(stockData.forwardPE, stockData.trailingPE) }}
              >
                {stockData.forwardPE ? stockData.forwardPE.toFixed(2) : 'N/A'}
              </span>
            </div>

            <div className="metric-row">
              <span className="metric-label">PEG Ratio:</span>
              <span 
                className="metric-value" 
                style={{ color: getPEGColor(stockData.pegRatio) }}
              >
                {stockData.pegRatio ? stockData.pegRatio.toFixed(2) : 'N/A'}
              </span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Price to Book:</span>
              <span className="metric-value">{stockData.priceToBook ? stockData.priceToBook.toFixed(2) : 'N/A'}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Dividend Yield:</span>
              <span className="metric-value">
                {stockData.dividendYield ? `${(stockData.dividendYield * 100).toFixed(2)}%` : 'N/A'}
              </span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Beta:</span>
              <span className="metric-value">{stockData.beta ? stockData.beta.toFixed(2) : 'N/A'}</span>
            </div>
          </div>

          {/* Color Legend */}
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Color Guide:</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#2ecc40' }}>● Good Value</span>
              <span style={{ color: '#f39c12' }}>● Fair Value</span>
              <span style={{ color: '#e74c3c' }}>● Overvalued</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetails; 