import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WatchlistAPI } from '../services/WatchlistAPI';
import { TickerAPI } from '../services/TickerAPI';
import Announcements from '../components/Announcements';
import '../styles/WatchlistPage.css';

const HomePage = () => {
  const { user } = useAuth();
  const [tickers, setTickers] = useState([]);
  const [availableTickers, setAvailableTickers] = useState([]);
  const [tickerMetrics, setTickerMetrics] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableTickers = async () => {
      try {
        const data = await TickerAPI.getAllTickers();
        setAvailableTickers(data);
      } catch (e) {
        setAvailableTickers([]);
      }
    };
    fetchAvailableTickers();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const fetchWatchlist = async () => {
      setLoading(true);
      try {
        const data = await WatchlistAPI.getWatchlistByUserId(user.id);
        if (data) {
          const tickerList = data.tickers ? data.tickers.split(',').map(t => t.trim()).filter(Boolean) : [];
          setTickers(tickerList);
        }
      } catch (e) {
        setTickers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, [user?.id]);

  useEffect(() => {
    const fetchMetrics = async () => {
      setMetricsLoading(true);
      const results = {};
      const errors = {};
      await Promise.all(
        tickers.map(async (symbol) => {
          try {
            const data = await TickerAPI.getStockInfo(symbol);
            results[symbol] = data.metrics;
          } catch (e) {
            errors[symbol] = 'Failed to load metrics';
          }
        })
      );
      setTickerMetrics(results);
      setMetricsError(errors);
      setMetricsLoading(false);
    };
    if (tickers.length > 0) {
      fetchMetrics();
    } else {
      setTickerMetrics({});
      setMetricsError({});
    }
  }, [tickers]);

  const handleViewDetails = (ticker) => {
    navigate(`/dashboard?ticker=${ticker}`);
  };

  return (
    <div className="container-fluid mt-3">
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h3 className="fw-bold mb-4">My Watchlist</h3>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : tickers.length === 0 ? (
                <div className="text-muted">No tickers in your watchlist yet.</div>
              ) : (
                <div className="row g-3">
                  {tickers.map((ticker, idx) => {
                    const tickerObj = availableTickers.find(t => t.symbol === ticker);
                    const metrics = tickerMetrics[ticker];
                    const error = metricsError[ticker];
                    return (
                      <div className="col-12 col-md-6 col-lg-4" key={ticker + idx}>
                        <div className="stock-metrics-card h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="fw-bold fs-4 mb-1">{ticker}</div>
                            <div className="text-muted mb-2">{tickerObj ? tickerObj.name : ''}</div>
                            {metricsLoading ? (
                              <div className="text-info">Loading metrics...</div>
                            ) : error ? (
                              <div className="text-danger small">{error}</div>
                            ) : metrics ? (
                              <>
                                <div className="mb-1"><span className="fw-semibold">Current Price:</span> <span className="fs-5">${metrics.current_price?.toLocaleString()}</span></div>
                                <div className="mb-1"><span className="fw-semibold">Change:</span> <span className={metrics.day_change > 0 ? 'text-success' : metrics.day_change < 0 ? 'text-danger' : ''}>{metrics.day_change && metrics.prev_close ? (metrics.day_change * metrics.prev_close).toFixed(2) : '-'}</span></div>
                                <div className="mb-1"><span className="fw-semibold">Change %:</span> <span className={metrics.day_change > 0 ? 'text-success' : metrics.day_change < 0 ? 'text-danger' : ''}>{metrics.day_change ? (metrics.day_change * 100).toFixed(2) + '%' : '-'}</span></div>
                                <div className="mb-1"><span className="fw-semibold">P/E Ratio:</span> {metrics.pe_ratio ?? '-'}</div>
                                <div className="mb-1"><span className="fw-semibold">Market Cap:</span> {metrics.market_cap ? '$' + (metrics.market_cap/1e9).toFixed(2) + 'B' : '-'}</div>
                              </>
                            ) : null}
                          </div>
                          <div className="mt-3">
                            <button className="btn btn-outline-primary btn-sm w-100" onClick={() => handleViewDetails(ticker)}>
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default HomePage; 