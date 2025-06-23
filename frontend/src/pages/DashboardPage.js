import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/DashboardPage.css";
import { TickerAPI } from "../services/TickerAPI";
import NewsSentiment from "../components/NewsSentiment";

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

  return (
    <div className="dashboard-layout">
      <Sidebar onToggle={setSidebarExpanded} />
      <main className={sidebarExpanded ? "" : "sidebar-collapsed"}>
        <div className="dashboard-header">
          <div className="dashboard-title">
            {loadingCompany ? "Loading..." : `${companyName} Stock and Predictions`}
          </div>
        </div>
        <div className="dashboard-content">
          <div className="dashboard-left">
            <div className="stock-info-box">
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
              <div id="tradingview-widget-container" ref={container}></div>
            </div>
            <NewsSentiment ticker={ticker} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 