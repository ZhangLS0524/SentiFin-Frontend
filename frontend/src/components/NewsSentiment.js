import React, { useState, useCallback } from 'react';
import { TickerAPI } from '../services/TickerAPI';
import { DashboardAPI } from '../services/DashboardAPI';
import './NewsSentiment.css';

const NewsSentiment = ({ ticker, onRelatedTickers, onSentimentData }) => {
    const [newsCache, setNewsCache] = useState({});
    const [relatedTickersCache, setRelatedTickersCache] = useState({});
    const [sentimentCache, setSentimentCache] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNewsAndRelated = useCallback(async () => {
        console.log('=== fetchNewsAndRelated called ===');
        console.log('Ticker:', ticker);
        if (!ticker) {
            console.log('No ticker provided, returning early');
            return;
        }
        console.log('Starting to fetch news...');
        setLoading(true);
        setError(null);
        try {
            // Get related companies from Gemini
            console.log('Fetching related companies...');
            const companyData = await DashboardAPI.getCompanyAndRelated(ticker);
            const related_tickers = companyData.companies.map(c => c.ticker).join(',');
            setRelatedTickersCache(prev => ({ ...prev, [ticker]: related_tickers }));
            if (onRelatedTickers) onRelatedTickers(related_tickers);

            // Get news sentiment
            console.log('Fetching news sentiment...');
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(toDate.getDate() - 30); 
            const time_from = fromDate.toISOString().split('T')[0];
            const time_to = toDate.toISOString().split('T')[0];
            const newsData = await TickerAPI.getNewsSentiment({
                ticker,
                time_from,
                time_to,
                related_tickers
            });
            const dateCounts = {};
            const filteredNews = [];
            if (newsData.news) {
                for (const newsItem of newsData.news) {
                    const date = newsItem.date;
                    const count = dateCounts[date] || 0;
                    if (count < 2) {
                        filteredNews.push(newsItem);
                        dateCounts[date] = count + 1;
                    }
                }
            }
            setNewsCache(prev => ({ ...prev, [ticker]: filteredNews }));
            setSentimentCache(prev => ({ ...prev, [ticker]: newsData.sentiment_summary }));
            if (onSentimentData) onSentimentData(newsData.sentiment_summary);
            console.log('News fetched successfully:', filteredNews.length, 'items');
        } catch (err) {
            console.error('Error fetching news:', err);
            setError('Failed to fetch news sentiment.');
        }
        setLoading(false);
    }, [ticker, onRelatedTickers, onSentimentData]);

    const news = newsCache[ticker] || [];

    const handleButtonClick = () => {
        console.log('=== Button clicked ===');
        console.log('Current ticker:', ticker);
        console.log('Loading state:', loading);
        fetchNewsAndRelated();
    };

    return (
        <div className="news-sentiment-container">
            <h4 style={{ marginBottom: '1rem' }}>Latest News</h4>
            <button onClick={handleButtonClick} disabled={loading} style={{ marginBottom: '1rem' }}>
                {loading ? 'Fetching...' : 'Fetch News'}
            </button>
            {error && <div className="error">{error}</div>}
            {news.length > 0 ? (
                <ul className="news-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {news.map((item, index) => (
                        <li key={index} style={{ marginBottom: '1rem' }}>
                            <strong><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a></strong>
                            <p style={{ margin: '0.2rem 0' }}><small>{item.source} - {new Date(item.date).toLocaleDateString()}</small></p>
                            <p style={{ margin: 0 }}>{item.summary}</p>
                            <p style={{ margin: '0.2rem 0' }}>
                                <strong>Sentiment: </strong>
                                <span className={`sentiment-label sentiment-${item.sentiment_label.toLowerCase()}`}>
                                    {item.sentiment_label} ({item.sentiment_score.toFixed(2)})
                                </span>
                            </p>
                        </li>
                    ))}
                </ul>
            ) : !loading && !error ? (
                <p>No news available for this ticker. Click "Fetch News" to load.</p>
            ) : null}
        </div>
    );
};

export default NewsSentiment; 