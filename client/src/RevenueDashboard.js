import React, { useState, useEffect } from 'react';
import './RevenueDashboard.css';

function RevenueDashboard() {
  const [revenueData, setRevenueData] = useState(null);
  const [contractInfo, setContractInfo] = useState(null);
  const [tokenHolders, setTokenHolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRevenueData();
    fetchContractInfo();
    fetchTokenHolders();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/finance/revenue-history`);
      const data = await response.json();
      
      if (data.success) {
        setRevenueData(data);
      } else {
        setError('Failed to fetch revenue data');
      }
    } catch (err) {
      setError('Error fetching revenue data: ' + err.message);
    }
  };

  const fetchContractInfo = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/finance/contract-info`);
      const data = await response.json();
      
      if (data.success) {
        setContractInfo(data.contractInfo);
      }
    } catch (err) {
      console.error('Error fetching contract info:', err);
    }
  };

  const fetchTokenHolders = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/finance/token-holders`);
      const data = await response.json();
      
      if (data.success) {
        setTokenHolders(data.tokenHolders);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching token holders:', err);
      setLoading(false);
    }
  };

  const formatAVAX = (amount) => {
    if (!amount) return '0.0000';
    return parseFloat(amount).toFixed(4);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="revenue-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="revenue-dashboard">
        <div className="error-state">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="revenue-dashboard">
      <div className="dashboard-header">
        <h2>💰 Revenue Dashboard</h2>
        <p>Real-time profit sharing via smart contract</p>
      </div>

      {/* Contract Information */}
      {contractInfo && (
        <div className="contract-info-card">
          <h3>📋 Smart Contract Info</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Contract:</label>
              <span className="contract-address">{contractInfo.contractAddress}</span>
            </div>
            <div className="info-item">
              <label>Token:</label>
              <span>{contractInfo.name} ({contractInfo.symbol})</span>
            </div>
            <div className="info-item">
              <label>Total Supply:</label>
              <span>{formatAVAX(contractInfo.totalSupply)} tokens</span>
            </div>
            <div className="info-item">
              <label>Contract Balance:</label>
              <span>{formatAVAX(contractInfo.balance)} AVAX</span>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Summary */}
      {revenueData && revenueData.summary && (
        <div className="revenue-summary">
          <h3>📊 Revenue Summary</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h4>Total Revenue</h4>
                <p className="amount">{formatAVAX(revenueData.summary.total_revenue)} AVAX</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">🎁</div>
              <div className="card-content">
                <h4>Total Dividends</h4>
                <p className="amount">{formatAVAX(revenueData.summary.total_dividends)} AVAX</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">🏢</div>
              <div className="card-content">
                <h4>Company Share</h4>
                <p className="amount">{formatAVAX(revenueData.summary.total_owner_share)} AVAX</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <h4>Distributions</h4>
                <p className="amount">{revenueData.summary.total_distributions || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Token Holders */}
      {tokenHolders.length > 0 && (
        <div className="token-holders-section">
          <h3>👥 Token Holders ({tokenHolders.length})</h3>
          <div className="token-holders-list">
            {tokenHolders.map((holder, index) => (
              <div key={holder.id} className="token-holder-card">
                <div className="holder-info">
                  <div className="holder-address">
                    <span className="address-label">Address:</span>
                    <span className="address-value">{holder.wallet_address}</span>
                  </div>
                  <div className="holder-stats">
                    <div className="stat-item">
                      <label>Tokens:</label>
                      <span>{formatAVAX(holder.token_balance)}</span>
                    </div>
                    <div className="stat-item">
                      <label>Available Dividend:</label>
                      <span className="dividend-amount">
                        {holder.current_dividend_info ? 
                          formatAVAX(holder.current_dividend_info.withdrawableDividend) : 
                          '0.0000'
                        } AVAX
                      </span>
                    </div>
                    <div className="stat-item">
                      <label>Total Earned:</label>
                      <span>{formatAVAX(holder.total_dividends_earned)} AVAX</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue History */}
      {revenueData && revenueData.history && revenueData.history.length > 0 && (
        <div className="revenue-history">
          <h3>📜 Recent Revenue Distributions</h3>
          <div className="history-list">
            {revenueData.history.slice(0, 10).map((distribution, index) => (
              <div key={distribution.id} className="history-item">
                <div className="distribution-info">
                  <div className="distribution-header">
                    <span className="project-type">{distribution.project_type.replace('_', ' ')}</span>
                    <span className="distribution-date">{formatDate(distribution.created_at)}</span>
                  </div>
                  <div className="distribution-amounts">
                    <div className="amount-item">
                      <label>Total:</label>
                      <span>{formatAVAX(distribution.revenue_amount)} AVAX</span>
                    </div>
                    <div className="amount-item">
                      <label>Dividends (20%):</label>
                      <span className="dividend-amount">{formatAVAX(distribution.dividend_share)} AVAX</span>
                    </div>
                    <div className="amount-item">
                      <label>Company (80%):</label>
                      <span>{formatAVAX(distribution.owner_share)} AVAX</span>
                    </div>
                  </div>
                  {distribution.transaction_hash && (
                    <div className="transaction-link">
                      <a 
                        href={`https://testnet.snowtrace.io/tx/${distribution.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tx-link"
                      >
                        View Transaction ↗
                      </a>
                    </div>
                  )}
                </div>
                <div className="distribution-status">
                  <span className={`status-badge ${distribution.status}`}>
                    {distribution.status === 'completed' ? '✅' : distribution.status === 'pending' ? '⏳' : '❌'}
                    {distribution.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!revenueData || !revenueData.history || revenueData.history.length === 0) && (
        <div className="empty-revenue-state">
          <div className="empty-icon">💰</div>
          <h3>No Revenue Distributions Yet</h3>
          <p>Revenue will be automatically distributed when AI agents complete projects!</p>
          <div className="revenue-flow-info">
            <h4>How it works:</h4>
            <ul>
              <li>🤖 AI agents complete projects (websites, marketing, etc.)</li>
              <li>💰 Revenue is automatically calculated and distributed</li>
              <li>🏢 80% goes to company operations</li>
              <li>🎁 20% is shared among token holders as dividends</li>
              <li>📊 All transactions are recorded on the blockchain</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default RevenueDashboard;
