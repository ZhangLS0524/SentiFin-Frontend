import React from 'react';

const PredictionInsights = ({ forecastData, newsSentiment }) => {
  if (!forecastData) return null;

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#28a745'; // High confidence - green
    if (confidence >= 0.6) return '#ffc107'; // Medium confidence - yellow
    return '#dc3545'; // Low confidence - red
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.2) return '#28a745'; // Bullish
    if (sentiment < -0.2) return '#dc3545'; // Bearish
    return '#6c757d'; // Neutral
  };

  return (
    <div className="prediction-insights" style={{ 
      background: '#f8f9fa', 
      padding: '16px', 
      borderRadius: '8px', 
      marginTop: '16px' 
    }}>
      <h5 style={{ marginBottom: '16px', color: '#333' }}>Prediction Insights</h5>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        
        {/* Prediction Confidence */}
        <div style={{ 
          background: 'white', 
          padding: '12px', 
          borderRadius: '6px', 
          border: '1px solid #dee2e6' 
        }}>
          <h6 style={{ marginBottom: '8px', color: '#495057' }}>Prediction Confidence</h6>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getConfidenceColor(forecastData.confidence || 0.7)
            }}></div>
            <span style={{ 
              fontWeight: 'bold',
              color: getConfidenceColor(forecastData.confidence || 0.7)
            }}>
              {((forecastData.confidence || 0.7) * 100).toFixed(1)}%
            </span>
          </div>
          <small style={{ color: '#6c757d' }}>
            {forecastData.confidence >= 0.8 ? 'High confidence prediction' :
             forecastData.confidence >= 0.6 ? 'Medium confidence prediction' :
             'Low confidence prediction'}
          </small>
        </div>

        {/* Market Sentiment */}
        {newsSentiment && (
          <div style={{ 
            background: 'white', 
            padding: '12px', 
            borderRadius: '6px', 
            border: '1px solid #dee2e6' 
          }}>
            <h6 style={{ marginBottom: '8px', color: '#495057' }}>Market Sentiment</h6>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getSentimentColor(newsSentiment.average_sentiment || 0)
              }}></div>
              <span style={{ 
                fontWeight: 'bold',
                color: getSentimentColor(newsSentiment.average_sentiment || 0)
              }}>
                {newsSentiment.average_sentiment ? 
                  (newsSentiment.average_sentiment > 0.2 ? 'Bullish' :
                   newsSentiment.average_sentiment < -0.2 ? 'Bearish' : 'Neutral') : 'N/A'}
              </span>
            </div>
            <small style={{ color: '#6c757d' }}>
              Based on {newsSentiment.items || 0} news articles
            </small>
          </div>
        )}

        {/* Prediction Factors */}
        <div style={{ 
          background: 'white', 
          padding: '12px', 
          borderRadius: '6px', 
          border: '1px solid #dee2e6' 
        }}>
          <h6 style={{ marginBottom: '8px', color: '#495057' }}>Prediction Factors</h6>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '16px', 
            fontSize: '14px',
            color: '#495057'
          }}>
            <li>Historical price patterns (3 months)</li>
            <li>Related company performance</li>
            <li>Market sentiment analysis</li>
            <li>Technical indicators</li>
            {forecastData.related_tickers && (
              <li>Competitor/partner analysis</li>
            )}
          </ul>
        </div>

        {/* Risk Assessment */}
        <div style={{ 
          background: 'white', 
          padding: '12px', 
          borderRadius: '6px', 
          border: '1px solid #dee2e6' 
        }}>
          <h6 style={{ marginBottom: '8px', color: '#495057' }}>Risk Assessment</h6>
          <div style={{ fontSize: '14px', color: '#495057' }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Market Volatility:</strong> 
              <span style={{ 
                color: forecastData.volatility > 0.3 ? '#dc3545' : 
                       forecastData.volatility > 0.15 ? '#ffc107' : '#28a745'
              }}>
                {forecastData.volatility > 0.3 ? ' High' :
                 forecastData.volatility > 0.15 ? ' Medium' : ' Low'}
              </span>
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Prediction Range:</strong> ±{((forecastData.confidence || 0.7) * 15).toFixed(1)}%
            </div>
            <small style={{ color: '#6c757d' }}>
              Past performance doesn't guarantee future results
            </small>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: '#fff3cd', 
        border: '1px solid #ffeaa7', 
        borderRadius: '6px',
        fontSize: '14px',
        color: '#856404'
      }}>
        <strong>Disclaimer:</strong> This prediction is based on historical data and market analysis. 
        It should not be considered as financial advice. Always conduct your own research and 
        consult with financial professionals before making investment decisions.
      </div>
    </div>
  );
};

export default PredictionInsights; 