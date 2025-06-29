import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/DashboardPage.css";
import { TickerAPI } from "../services/TickerAPI";
import NewsSentiment from "../components/NewsSentiment";
import StockDetails from "../components/StockDetails";
import { DashboardAPI } from "../services/DashboardAPI";
import LightweightForecastChart from '../components/LightweightForecastChart';
import PredictionInsights from '../components/PredictionInsights';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Only valid TradingView intervals
const INTERVALS = [
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
  { label: "1M", value: "M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "12M" },
];

const DashboardPage = () => {
  const query = useQuery();
  const ticker = (query.get("ticker") || "AAPL").toUpperCase();
  const container = useRef(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState("D");
  const [companyName, setCompanyName] = useState("");
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [showStockDetails, setShowStockDetails] = useState(false);
  const [forecastOn, setForecastOn] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [relatedTickers, setRelatedTickers] = useState("");
  const [newsSentiment, setNewsSentiment] = useState(null);

  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = "";
    }
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      // eslint-disable-next-line no-undef
      new window.TradingView.widget({
        width: "100%",
        height: 300,
        symbol: ticker,
        interval: selectedInterval,
        timezone: "Etc/UTC",
        theme: "light",
        style: "1",
        locale: "en",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: "tradingview-widget-container",
      });
    };
    container.current.appendChild(script);
  }, [ticker, selectedInterval]);

  useEffect(() => {
    setLoadingCompany(true);
    TickerAPI.getTickerBySymbol(ticker)
      .then((data) => {
        setCompanyName(data.name ? `${data.name} (${data.symbol})` : ticker);
        setLoadingCompany(false);
      })
      .catch(() => {
        setCompanyName(ticker);
        setLoadingCompany(false);
      });
  }, [ticker]);

  useEffect(() => {
    const fetchForecast = async () => {
      if (!forecastOn) {
        setForecastData(null);
        return;
      }
      setLoadingForecast(true);
      try {
        // Get 3 months ago and today in YYYY-MM-DD
        const today = new Date();
        const time_to = today.toISOString().slice(0, 10);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const time_from = threeMonthsAgo.toISOString().slice(0, 10);
        // Use relatedTickers from NewsSentiment if available
        let related_tickers = relatedTickers;
        let relationships = "";
        if (!related_tickers) {
          // fallback: fetch if not available
          const related = await DashboardAPI.getCompanyAndRelated(ticker);
          related_tickers = related.companies.map(c => c.ticker).join(',');
          relationships = related.companies
            .map(c => [ticker, c.ticker, c.relationship === 'competitor' ? 'COMPETITORS' : 'PARTNERSHIP'].join(','))
            .join(';');
        } else {
          // If related_tickers is available, fetch relationships as well
          const related = await DashboardAPI.getCompanyAndRelated(ticker);
          relationships = related.companies
            .map(c => [ticker, c.ticker, c.relationship === 'competitor' ? 'COMPETITORS' : 'PARTNERSHIP'].join(','))
            .join(';');
        }
        console.log('Debug - related_tickers:', related_tickers);
        console.log('Debug - relationships:', relationships);
        // Fetch forecast data
        const forecast = await DashboardAPI.getStockForecast(
          ticker, time_from, time_to, related_tickers, relationships
        );
        setForecastData(forecast);
      } catch (err) {
        setForecastData(null);
      }
      setLoadingForecast(false);
    };
    fetchForecast();
  }, [forecastOn, ticker, relatedTickers]);

  return (
    <div className="dashboard-layout">
      <Sidebar onToggle={setSidebarExpanded} />
      <main className={sidebarExpanded ? "" : "sidebar-collapsed"}>
        <div className="dashboard-header">
          <div className="dashboard-title">
            {loadingCompany ? "Loading..." : `${companyName} Stock and Predictions`}
          </div>
        </div>
        <div className={`dashboard-content ${showStockDetails ? 'with-stock-details' : ''}`}>
          <div className="dashboard-left">
            <div className="stock-info-box">
              <div className="stock-controls">
                <div className="stock-period-btns">
                  {INTERVALS.map((btn) => (
                    <button
                      key={btn.label}
                      className={selectedInterval === btn.value ? "active" : ""}
                      onClick={() => setSelectedInterval(btn.value)}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
                <div className="stock-forecast-toggle-container" style={{ marginLeft: 12 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={forecastOn}
                      onChange={e => setForecastOn(e.target.checked)}
                      style={{ marginRight: 6 }}
                    />
                    Stock Forecasting
                  </label>
                </div>
                <div className="stock-details-toggle-container">
                  <button
                    className={`stock-details-toggle-btn ${showStockDetails ? 'active' : ''}`}
                    onClick={() => setShowStockDetails(!showStockDetails)}
                  >
                    {showStockDetails ? 'Hide Stock Details' : 'View Stock Details'}
                  </button>
                </div>
              </div>
              <div id="tradingview-widget-container" ref={container}></div>
              {forecastOn && loadingForecast && (
                <div style={{ marginTop: 16 }}>Loading forecast...</div>
              )}
              {forecastOn && forecastData && Array.isArray(forecastData.future_predictions) && forecastData.future_predictions.length > 0 && (
                <div className="forecast-box" style={{ marginTop: 16, background: "#f8f9fa", padding: 12, borderRadius: 8 }}>
                  <h4>Stock Price Forecast</h4>
                  <LightweightForecastChart
                    historicalData={forecastData.historical_data ? forecastData.historical_data.map(item => ({
                      time: item.date,
                      value: item.price,
                    })) : []}
                    forecastData={forecastData.future_predictions.map(item => ({
                      time: item.date,
                      value: item.predicted_price,
                    }))}
                    height={300}
                  />
                  <PredictionInsights 
                    forecastData={forecastData} 
                    newsSentiment={newsSentiment}
                  />
                </div>
              )}
            </div>
            <NewsSentiment 
              ticker={ticker} 
              onRelatedTickers={setRelatedTickers}
              onSentimentData={setNewsSentiment}
            />
          </div>
          {showStockDetails && (
            <div className="dashboard-stock-details">
              <StockDetails ticker={ticker} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 