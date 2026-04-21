import { useState } from 'react';
import '../Contributor.css';

const CATEGORY_COLORS = [
  'linear-gradient(90deg,#22d3ee,#7c5cff)',
  'linear-gradient(90deg,#3ee08f,#22d3ee)',
  'linear-gradient(90deg,#f5c451,#f97316)',
  'linear-gradient(90deg,#a78bfa,#ec4899)',
  'linear-gradient(90deg,#60a5fa,#3b82f6)',
  'linear-gradient(90deg,#fb7185,#f43f5e)',
];

const ContributionCharts = ({ stats }) => {
  const [activeTab, setActiveTab] = useState('monthly');

  if (!stats) {
    return (
      <div className="charts-section">
        <p style={{ color: '#6e7a99', textAlign: 'center', padding: '2rem' }}>Loading charts…</p>
      </div>
    );
  }

  const { monthly = {}, byCategory = {}, heatmap = {}, resolvedIssues = [] } = stats;

  const monthlyEntries = Object.entries(monthly);
  const maxMonthly = Math.max(...monthlyEntries.map(([, v]) => v), 1);

  const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCategory = Math.max(...categoryEntries.map(([, v]) => v), 1);

  // Build last 6 months for heatmap
  const last6Months = [];
  const now = new Date();
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthKey = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    const days = [];
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ date: dateStr, amount: heatmap[dateStr] || 0 });
    }
    last6Months.push({ label: monthKey, days });
  }

  const getIntensity = (amount) => {
    if (!amount) return 0;
    if (amount < 100)  return 1;
    if (amount < 500)  return 2;
    if (amount < 1000) return 3;
    return 4;
  };

  const tabs = [
    { id: 'monthly',  label: '📅 Monthly' },
    { id: 'category', label: '🗂 Category' },
    { id: 'heatmap',  label: '🔥 Activity' },
    { id: 'resolved', label: '✅ Resolved' },
  ];

  return (
    <div className="charts-section">
      <div className="charts-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`chart-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="chart-container">
        {/* ── MONTHLY ── */}
        {activeTab === 'monthly' && (
          <>
            <h3>Monthly Contributions</h3>
            {monthlyEntries.length === 0 ? (
              <p style={{ color: '#6e7a99', textAlign: 'center', paddingTop: '2rem' }}>No data yet</p>
            ) : (
              <div className="monthly-chart">
                {monthlyEntries.map(([month, amount]) => {
                  const pct = (amount / maxMonthly) * 100;
                  return (
                    <div key={month} className="bar-row">
                      <span className="bar-label">{month}</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${Math.max(pct, 4)}%` }}>
                          ₹{amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── CATEGORY ── */}
        {activeTab === 'category' && (
          <>
            <h3>By Category</h3>
            {categoryEntries.length === 0 ? (
              <p style={{ color: '#6e7a99', textAlign: 'center', paddingTop: '2rem' }}>No data yet</p>
            ) : (
              <div className="category-chart">
                {categoryEntries.map(([cat, amount], i) => {
                  const pct = (amount / maxCategory) * 100;
                  return (
                    <div key={cat} className="h-bar-container">
                      <span className="h-bar-label">{cat}</span>
                      <div className="h-bar-wrapper">
                        <div
                          className="h-bar-fill"
                          style={{
                            width: `${Math.max(pct, 4)}%`,
                            background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                          }}
                        />
                        <span className="h-bar-value">₹{amount.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── HEATMAP ── */}
        {activeTab === 'heatmap' && (
          <>
            <h3>Contribution Activity</h3>
            <div className="calendar-heatmap">
              <div className="heatmap-months">
                {last6Months.map(({ label, days }) => (
                  <div key={label} className="month-group">
                    <span className="month-label">{label}</span>
                    <div className="day-grid">
                      {days.map(({ date, amount }) => (
                        <div
                          key={date}
                          className={`heatmap-day intensity-${getIntensity(amount)}`}
                          title={amount ? `${date}: ₹${amount.toLocaleString()}` : date}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.75rem', color: '#6e7a99' }}>
                <span>Less</span>
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`heatmap-day intensity-${i}`} style={{ margin: 0 }} />
                ))}
                <span>More</span>
              </div>
            </div>
          </>
        )}

        {/* ── RESOLVED ── */}
        {activeTab === 'resolved' && (
          <>
            <h3>Issues You Helped Resolve ({resolvedIssues.length})</h3>
            {resolvedIssues.length === 0 ? (
              <p style={{ color: '#6e7a99', textAlign: 'center', paddingTop: '2rem' }}>
                No resolved issues yet — keep contributing! 🌱
              </p>
            ) : (
              <div className="resolved-list">
                {resolvedIssues.map((issue) => (
                  <div key={issue._id} className="resolved-item">
                    <div className="resolved-icon">✅</div>
                    <div className="resolved-info">
                      <div className="resolved-title">{issue.title}</div>
                      <div className="resolved-cat">{issue.category}</div>
                    </div>
                    <span className="resolved-badge">Resolved</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContributionCharts;
