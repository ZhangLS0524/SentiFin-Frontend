import React, { useState, useEffect } from 'react';
import { TickerAPI } from '../services/TickerAPI';
import { DashboardAPI } from '../services/DashboardAPI';
import './NewsSentiment.css';

const NewsSentiment = ({ ticker }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError(null);
            try {
                // Step 1: Get related companies from Gemini
                const companyData = await DashboardAPI.getCompanyAndRelated(ticker);
                const related_tickers = companyData.companies.map(c => c.ticker).join(',');

                // Step 2: Get news sentiment
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

                setNews(filteredNews);
            } catch (err) {
                setError('Failed to fetch news sentiment.');
                console.error(err);
            }
            setLoading(false);
        };

        if (ticker) {
            fetchNews();
        }
    }, [ticker]);

    if (loading) {
        return <div>Loading news...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="news-sentiment-container">
            <h4 style={{ marginBottom: '1rem' }}>Latest News</h4>
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
            ) : (
                <p>No news available for this ticker.</p>
            )}
        </div>
    );
};

export default NewsSentiment; 