import React, { useState } from 'react';
import '../styles/apiDocumentationPage.css';
import { FiEye, FiEyeOff, FiCopy, FiList } from 'react-icons/fi';

const stockInfoSample = {
  "ticker": "AAPL",
  "metrics": {
    "current_price": 196.58,
    "market_cap": 2936079646720.0,
    "pe_ratio": 30.572319,
    "dividend_yield": 53.0,
    "52_week_high": 260.1,
    "52_week_low": 169.21,
    "day_change": 0.480476,
    "week_change": 0.48047434062565236,
    "year_change": -5.2580833,
    "volume": 44864157,
    "avg_volume": 61130764,
    "beta": 1.211,
    "eps": 6.43,
    "target_price": 228.85326,
    "recommendation": "buy",
    "day_high": 197.57,
    "day_low": 195.07,
    "open_price": 195.945,
    "prev_close": 195.64
  },
  "historical_data": [
    {
      "date": "2024-06-20",
      "open": 212.93418113045576,
      "high": 213.24275088537271,
      "low": 207.87784112226225,
      "close": 208.70396423339844,
      "volume": 86172500,
      "adjusted_close": 208.70396423339844
    },
    {
      "date": "2024-06-21",
      "open": 209.41064929966387,
      "high": 210.90366690915465,
      "low": 206.14591867526494,
      "close": 206.52415466308594,
      "volume": 246421400,
      "adjusted_close": 206.52415466308594
    }
    // ... more historical data ...
  ]
};

const newsSentimentSample = {
    "ticker": "NVDA",
    "time_from": "2025-01-01",
    "time_to": "2025-06-20",
    "items": 687,
    "sentiment_score_definition": "x <= -0.35: Bearish; -0.35 < x <= -0.15: Somewhat-Bearish; -0.15 < x < 0.15: Neutral; 0.15 <= x < 0.35: Somewhat_Bullish; x >= 0.35: Bullish",
    "relevance_score_definition": "0 < x <= 1, with a higher score indicating higher relevance.",
    "news": [
        {
            "date": "2025-06-20",
            "title": "Could Investing $10,000 in CoreWeave Make You a Millionaire?",
            "url": "https://www.fool.com/investing/2025/06/20/could-investing-10000-coreweave-make-millions/",
            "source": "Motley Fool",
            "summary": "Investors have piled into artificial intelligence ( AI ) stocks over the past couple of years, especially big names such as AI chip leader Nvidia or cloud giant Amazon. Though these companies have helped shareholders score a major win quarter after quarter and could continue to climb, some ...",
            "sentiment_score": 0.264207,
            "sentiment_label": "Somewhat-Bullish",
            "relevance_score": 0.234119,
            "topics": [
                { "topic": "IPO", "relevance_score": "0.158519" },
                { "topic": "Retail & Wholesale", "relevance_score": "0.5" },
                { "topic": "Financial Markets", "relevance_score": "0.980716" },
                { "topic": "Manufacturing", "relevance_score": "0.5" },
                { "topic": "Earnings", "relevance_score": "0.538269" }
            ]
        },
        {
            "date": "2025-06-20",
            "title": "2 Artificial Intelligence  ( AI )  Stocks That Could Soar in the Second Half of 2025",
            "url": "https://www.fool.com/investing/2025/06/20/2-ai-stocks-that-could-soar-second-half/",
            "source": "Motley Fool",
            "summary": "Artificial intelligence ( AI ) stocks were the market's biggest winners last year as investors flocked to this area of great opportunity. Analysts expect the AI market to reach into the trillions of dollars in the coming years, which suggests some of today's early players in the field could ...",
            "sentiment_score": 0.397746,
            "sentiment_label": "Bullish",
            "relevance_score": 0.402135,
            "topics": [
                { "topic": "Economy - Monetary", "relevance_score": "0.158519" },
                { "topic": "Financial Markets", "relevance_score": "0.495866" },
                { "topic": "Manufacturing", "relevance_score": "0.5" },
                { "topic": "Earnings", "relevance_score": "0.99999" },
                { "topic": "Technology", "relevance_score": "0.5" }
            ]
        }
    ],
    "sentiment_summary": {
        "average_sentiment": 0.16673700727802038,
        "sentiment_distribution": {
            "Bearish": 11,
            "Somewhat-Bearish": 9,
            "Neutral": 311,
            "Somewhat-Bullish": 260,
            "Bullish": 96
        }
    }
};

function CollapsibleSample({ json }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="api-doc-sample-section">
      <button className="api-doc-collapse-btn" onClick={() => setOpen(o => !o)}>
        {open ? <FiEyeOff size={20} /> : <FiEye size={20} />} {open ? 'Hide' : 'Show'} Sample Response
      </button>
      {open && (
        <div className="api-doc-sample-json-container">
          <pre className="api-doc-sample-json">{JSON.stringify(json, null, 2)}</pre>
          <button className="api-doc-copy-btn" onClick={handleCopy}>
            <FiCopy size={18} /> {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
}

const apiSections = [
  {
    title: 'Stock Information',
    description: 'Retrieve real-time stock information for a given ticker symbol.',
    endpoint: 'http://localhost:8000/api/StockInfo/{ticker}',
    parameters: [
      { name: 'ticker', type: 'string', required: true, description: 'The ticker symbol of the stock to analyze.' },
    ],
    example: 'GET /api/StockInfo/AAPL',
    sample: <CollapsibleSample json={stockInfoSample} />,
  },
  {
    title: 'News Sentiment',
    description: 'Get sentiment analysis on news related to a specific stock and its related tickers within a date range.',
    endpoint: 'http://localhost:8000/api/NewsSentiment?ticker={ticker}&time_from={time_from}&time_to={time_to}&related_tickers={related_tickers}',
    parameters: [
      { name: 'ticker', type: 'string', required: true, description: 'The ticker symbol of the stock to analyze.' },
      { name: 'time_from', type: 'string', required: true, description: 'The start date for the sentiment analysis.' },
      { name: 'time_to', type: 'string', required: true, description: 'The end date for the sentiment analysis.' },
      { name: 'related_tickers', type: 'string', required: true, description: 'Comma-separated list of related tickers to include in the analysis.' },
    ],
    example: 'GET /api/NewsSentiment?ticker=NVDA&time_from=2025-01-01&time_to=2025-06-20&related_tickers=AMD,TXI',
    sample: <CollapsibleSample json={newsSentimentSample} />,
  },
  {
    title: 'Stock Price Prediction',
    description: 'Predict stock prices using our in-house machine learning pipeline, with support for related tickers and relationship types.',
    endpoint: 'http://localhost:8000/api/PredictStockPrice?ticker={ticker}&time_from={time_from}&time_to={time_to}&related_tickers={related_tickers}&relationships={relationships}',
    parameters: [
      { name: 'ticker', type: 'string', required: true, description: 'The ticker symbol of the stock to analyze.' },
      { name: 'time_from', type: 'string', required: true, description: 'The start date for the prediction.' },
      { name: 'time_to', type: 'string', required: true, description: 'The end date for the prediction.' },
      { name: 'related_tickers', type: 'string', required: true, description: 'Comma-separated list of related tickers to include in the prediction.' },
      { name: 'relationships', type: 'string', required: true, description: 'Comma-separated list of relationships to include in the prediction.' },
    ],
    example: 'GET /api/PredictStockPrice?ticker=NVDA&time_from=2023-01-01&time_to=2024-12-31&related_tickers=AMD,INTC,MSFT&relationships= NVDA,AMD,COMPETITORS;NVDA,INTC,COMPETITORS;NVDA,MSFT,PARTNERSHIP',
  },
];

const ApiDocumentationPage = () => {
  return (
    <div className="api-doc-container">
      <h1 className="api-doc-title">API Documentation</h1>
      <div className="api-doc-sections">
        {apiSections.map((section, idx) => (
          <div className="api-doc-section" key={idx}>
            <h2>{section.title}</h2>
            <p className="api-doc-description">{section.description}</p>
            <div className="api-doc-endpoint">
              <span className="api-doc-label">Endpoint:</span>
              <code>{section.endpoint}</code>
            </div>
            <div className="api-doc-example">
              <span className="api-doc-label">Example:</span>
              <code>{section.example}</code>
            </div>
            {section.parameters && section.parameters.length > 0 && (
              <div className="api-doc-params">
                <div className="api-doc-params-header">
                  <FiList size={20} className="api-doc-params-icon" />
                  <span className="api-doc-label">Parameters</span>
                </div>
                <table className="api-doc-params-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.parameters.map((param, i) => (
                      <tr key={i}>
                        <td>{param.name}</td>
                        <td>{param.type}</td>
                        <td>{param.required ? 'Yes' : 'No'}</td>
                        <td>{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {section.sample && section.sample}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiDocumentationPage; 