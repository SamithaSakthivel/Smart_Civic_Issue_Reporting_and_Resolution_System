// src/components/charts/CategoryContributions.jsx
import { useMemo } from 'react';
import '../../Contributor.css';
const CategoryContributions = ({ contributions = [] }) => {
  const categoryData = useMemo(() => {
    const data = {};
    contributions.forEach(contrib => {
      const category = contrib.issue?.category || 'Other';
      data[category] = (data[category] || 0) + contrib.amount;
    });
    return Object.entries(data)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [contributions]);

  const maxAmount = Math.max(...categoryData.map(d => d.amount), 1000);

  const getIntensity = (amount) => {
    if (amount >= 10000) return 4;
    if (amount >= 5000) return 3;
    if (amount >= 2000) return 2;
    if (amount >= 500) return 1;
    return 0;
  };

  return (
    <div className="chart-container">
      <h3>Contributions by Category</h3>
      <div className="category-chart">
        {categoryData.map((data, idx) => (
          <div key={idx} className="h-bar-container">
            <span className="h-bar-label">{data.category}</span>
            <div className="h-bar-wrapper">
              <div 
                className={`h-bar-fill intensity-${getIntensity(data.amount)}`}
                style={{ width: `${Math.min((data.amount / maxAmount) * 100, 100)}%` }}
              />
              <span className="h-bar-value">₹{data.amount.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryContributions;