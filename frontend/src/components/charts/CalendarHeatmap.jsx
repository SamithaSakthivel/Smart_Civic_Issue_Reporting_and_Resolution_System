// src/components/charts/CalendarHeatmap.jsx
import { useMemo } from 'react';
import '../../Contributor.css';

const CalendarHeatmap = ({ contributions = [] }) => {
  const heatmapData = useMemo(() => {
    const data = {};
    contributions.forEach(contrib => {
      const date = new Date(contrib.createdAt);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      const key = `${month}-${day}`;
      data[key] = (data[key] || 0) + 1;
    });
    return data;
  }, [contributions]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <div className="chart-container">
      <h3>Contribution Heatmap 2026</h3>
      <div className="calendar-heatmap">
        <div className="heatmap-header">
          <span>Less</span>
          <span style={{marginLeft: '60%'}}>More</span>
        </div>
        <div className="heatmap-months">
          {months.map((month, monthIdx) => (
            <div key={monthIdx} className="month-group">
              <div className="month-label">{month}</div>
              <div className="day-grid">
                {Array.from({ length: 28 }, (_, dayIdx) => {
                  const day = dayIdx + 1;
                  const key = `${month}-${day}`;
                  const count = heatmapData[key] || 0;
                  
                  const intensity = Math.min(count, 4);
                  return (
                    <div
                      key={dayIdx}
                      className={`heatmap-day intensity-${intensity}`}
                      title={`${day} ${month}: ${count} contributions`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeatmap;