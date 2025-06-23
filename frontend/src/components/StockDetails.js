import React from 'react';
import { Button } from 'react-bootstrap';

const StockDetails = () => (
  <div className="container-fluid mt-3">
    <div className="row">
      <div className="col-12 mb-3">
        <div className="bg-dark text-white rounded p-3 d-flex justify-content-between align-items-center">
          <div>
            <h5>Apple Inc <span className="text-success">202.40 <small>+8.37 (+4.31%)</small></span></h5>
            {/* Placeholder for TradingView chart */}
            <div className="bg-secondary rounded mt-2" style={{height: '180px'}}></div>
          </div>
          <div className="ms-3">
            <h6 className="text-info">AAPL Financials</h6>
            <div style={{fontSize: '0.9em'}}>
              {/* Placeholder for financials */}
              <div>Fiscal year end: 2022-09-30</div>
              <div>Cash Flow: 90.5B</div>
              <div>Valuation: 3.05T</div>
              <div>Profitability: 44.63%</div>
              <div>Efficiency: 1.09</div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="border rounded p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">View Prediction</span>
            <div>
              <Button size="sm" variant="outline-primary" className="me-2">With Sentiment</Button>
              <Button size="sm" variant="outline-secondary">Without</Button>
            </div>
          </div>
          <div className="bg-light rounded" style={{height: '180px', border: '1px dashed #aaa'}}>
            GRAPH
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="border rounded p-3 mb-3">
          <span className="fw-bold">News</span>
          <div className="bg-light rounded mt-2" style={{height: '180px', border: '1px dashed #aaa'}}>
            NEWS | Competitor | Polarity Score<br />
            NEWS | Partnership | Polarity Score
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default StockDetails; 