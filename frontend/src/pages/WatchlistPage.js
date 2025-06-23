import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WatchlistAPI } from '../services/WatchlistAPI';
import { TickerAPI } from '../services/TickerAPI';
import { FiTrash } from 'react-icons/fi';
import '../styles/WatchlistPage.css';

const WatchlistPage = () => {
  const { user } = useAuth();
  const [watchlistId, setWatchlistId] = useState(null);
  const [tickers, setTickers] = useState([]); // user's watchlist (symbols)
  const [availableTickers, setAvailableTickers] = useState([]); // from backend
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tickerMetrics, setTickerMetrics] = useState({}); // { symbol: metrics }
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available tickers from backend
    const fetchAvailableTickers = async () => {
      try {
        const data = await TickerAPI.getAllTickers(); // get all active tickers
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
          setWatchlistId(data.id);
          const tickerList = data.tickers ? data.tickers.split(',').map(t => t.trim()).filter(Boolean) : [];
          setTickers(tickerList);
        }
      } catch (e) {
        setTickers([]);
        setWatchlistId(null);
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

  const handleAddTicker = async (tickerSymbol) => {
    if (!tickerSymbol || tickers.includes(tickerSymbol)) return;
    const updatedTickers = [...tickers, tickerSymbol];
    setTickers(updatedTickers);
    try {
      if (watchlistId) {
        await WatchlistAPI.updateWatchlist(watchlistId, {
          userId: user.id,
          tickers: updatedTickers.join(',')
        });
      } else {
        const data = await WatchlistAPI.createWatchlist({
          userId: user.id,
          tickers: updatedTickers.join(',')
        });
        setWatchlistId(data.id);
      }
    } catch (e) {
      // Optionally show error
    }
  };

  const handleRemoveTicker = async (tickerSymbol) => {
    const updatedTickers = tickers.filter(t => t !== tickerSymbol);
    setTickers(updatedTickers);
    try {
      if (watchlistId) {
        await WatchlistAPI.updateWatchlist(watchlistId, {
          userId: user.id,
          tickers: updatedTickers.join(',')
        });
      }
    } catch (e) {
      // Optionally show error
    }
  };

  const handleViewDetails = (ticker) => {
    navigate(`/dashboard?ticker=${ticker}`);
  };

  // Filter available tickers by search and exclude those already in watchlist
  const filteredTickers = availableTickers.filter(tickerObj =>
    (tickerObj.symbol.toLowerCase().includes(search.toLowerCase()) ||
     tickerObj.name.toLowerCase().includes(search.toLowerCase())) &&
    !tickers.includes(tickerObj.symbol)
  );

  if (loading) return <div className="container py-4">Loading...</div>;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="card-title mb-3">Add Tickers to Your Watchlist</h4>
            <div className="mb-3" style={{ maxWidth: 400 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search for a ticker (e.g. MSFT or Microsoft)"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto', overflowX: 'hidden' }}>
              <div className="row g-2" style={{ flexWrap: 'wrap' }}>
                {filteredTickers.length === 0 && (
                  <div className="col-12 text-muted">No tickers found.</div>
                )}
                {filteredTickers.map(tickerObj => (
                  <div className="col-12 col-md-6 col-lg-4" key={tickerObj.symbol}>
                    <div className="d-flex align-items-center justify-content-between border rounded p-2 bg-light">
                      <div>
                        <span className="fw-bold">{tickerObj.symbol}</span>
                        <span className="text-muted ms-2">{tickerObj.name}</span>
                      </div>
                      <button
                        className="btn btn-sm btn-success ms-2"
                        disabled={tickers.includes(tickerObj.symbol)}
                        onClick={() => handleAddTicker(tickerObj.symbol)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="card-title mb-0">My Watchlist</h4>
          </div>
          <ul className="list-group mb-3">
            {tickers.length === 0 && (
              <li className="list-group-item text-muted">No tickers in your watchlist yet.</li>
            )}
            {tickers.map((ticker, idx) => {
              const tickerObj = availableTickers.find(t => t.symbol === ticker);
              const metrics = tickerMetrics[ticker];
              const error = metricsError[ticker];
              return (
                <li key={ticker + idx} className="list-group-item">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div className="flex-grow-1">
                      <div className="fw-bold fs-5">{ticker}</div>
                      <div className="text-muted small mb-2">{tickerObj ? tickerObj.name : ''}</div>
                      {metricsLoading ? (
                        <div className="text-info">Loading metrics...</div>
                      ) : error ? (
                        <div className="text-danger small">{error}</div>
                      ) : metrics ? (
                        <div className="stock-metrics-card p-2 rounded bg-light border mt-2">
                          <div className="row g-2 align-items-center">
                            <div className="col-12 col-md-4 mb-2 mb-md-0">
                              <span className="fw-semibold">Current Price:</span> <span className="fs-5">${metrics.current_price?.toLocaleString()}</span>
                            </div>
                            <div className="col-6 col-md-2">
                              <span className="fw-semibold">Change:</span> <span className={metrics.day_change > 0 ? 'text-success' : metrics.day_change < 0 ? 'text-danger' : ''}>
                                {metrics.day_change && metrics.prev_close ? (metrics.day_change * metrics.prev_close).toFixed(2) : '-'}
                              </span>
                            </div>
                            <div className="col-6 col-md-2">
                              <span className="fw-semibold">Change %:</span> <span className={metrics.day_change > 0 ? 'text-success' : metrics.day_change < 0 ? 'text-danger' : ''}>
                                {metrics.day_change ? (metrics.day_change * 100).toFixed(2) + '%' : '-'}
                              </span>
                            </div>
                            <div className="col-6 col-md-2">
                              <span className="fw-semibold">P/E Ratio:</span> {metrics.pe_ratio ?? '-'}
                            </div>
                            <div className="col-6 col-md-2">
                              <span className="fw-semibold">Market Cap:</span> {metrics.market_cap ? '$' + (metrics.market_cap/1e9).toFixed(2) + 'B' : '-'}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="ms-3 d-flex flex-column align-items-end">
                      <button className="btn btn-outline-primary btn-sm mb-2" onClick={() => handleViewDetails(ticker)}>
                        View Details
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveTicker(ticker)} title="Remove">
                        <FiTrash />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WatchlistPage; 