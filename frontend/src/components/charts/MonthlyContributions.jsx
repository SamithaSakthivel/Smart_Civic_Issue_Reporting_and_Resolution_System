// src/components/charts/MonthlyContributions.jsx
import { useMemo } from 'react';
import '../../Contributor.css';

const MonthlyContributions = ({ contributions = [] }) => {
  const monthlyData = useMemo(() => {
    const data = {};
    contributions.forEach(contrib => {
      const month = new Date(contrib.createdAt).toLocaleDateString('en-US', { month: 'short' });
      data[month] = (data[month] || 0) + contrib.amount;
    });
    return Object.entries(data).map(([month, amount]) => ({ month, amount }));
  }, [contributions]);

  const maxAmount = Math.max(...monthlyData.map(d => d.amount), 1000);

  const getIntensity = (amount) => {
    if (amount >= 5000) return 4;
    if (amount >= 2000) return 3;
    if (amount >= 1000) return 2;
    if (amount >= 500) return 1;
    return 0;
  };

  return (
    <div className="chart-container">
      <h3>Monthly Contributions (₹)</h3>
      <div className="monthly-chart">
        {monthlyData.map((data, idx) => (
          <div key={idx} className="bar-container">
            <span className="bar-label">{data.month}</span>
            <div className="bar-wrapper">
              <div 
                className={`bar-fill intensity-${getIntensity(data.amount)}`}
                style={{ width: `${Math.min((data.amount / maxAmount) * 100, 100)}%` }}
              >
                ₹{data.amount.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyContributions;