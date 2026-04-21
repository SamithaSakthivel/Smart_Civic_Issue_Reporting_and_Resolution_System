import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../Admin.css';

const AdminStatsPieChart = ({ complaints = [] }) => {
  const canvasRef = useRef(null);
  const [hoveredStatus, setHoveredStatus] = useState(null);


  const statusCounts = {
    pending: complaints.filter(c => c.status === 'pending').length,
    inprogress: complaints.filter(c => c.status === 'inprogress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    cancelled: complaints.filter(c => c.status === 'cancelled').length,
  };

  const totalComplaints = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  

  const statusData = [
    { status: 'pending', count: statusCounts.pending, color: '#f59e0b' },
    { status: 'inprogress', count: statusCounts.inprogress, color: '#3b82f6' },
    { status: 'resolved', count: statusCounts.resolved, color: '#10b981' },
    { status: 'cancelled', count: statusCounts.cancelled, color: '#ef4444' },
  ];


  const drawPieChart = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const centerX = 125; 
  const centerY = 125;
  const radius = 110;   

  if (totalComplaints === 0) {
    ctx.clearRect(0, 0, 250, 250);
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No complaints', centerX, centerY);
    return;
  }

  ctx.clearRect(0, 0, 250, 250);

  let cumulativeAngle = -90;
  statusData.forEach(item => {
    if (item.count > 0) {
      const sliceAngle = (item.count / totalComplaints) * 360;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, 
        (cumulativeAngle * Math.PI) / 180, 
        ((cumulativeAngle + sliceAngle) * Math.PI) / 180
      );
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      
      ctx.fillStyle = item.color;
      ctx.shadowColor = item.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      cumulativeAngle += sliceAngle;
    }
  });
}, [statusCounts, totalComplaints]);


const handleMouseMove = (e) => {
  const canvas = canvasRef.current;
  if (!canvas || totalComplaints === 0) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const distance = Math.sqrt((x - 125) ** 2 + (y - 125) ** 2);
  if (distance > 110) {
    setHoveredStatus(null);
    return;
  }
  

  let angle = Math.atan2(y - 125, x - 125) * 180 / Math.PI;
  angle = (angle + 360) % 360; 
  

  let cumulativeAngle = 270; 
  
  for (let item of statusData) {
    if (item.count > 0) {
      const sliceAngle = (item.count / totalComplaints) * 360;
  
     if (angle >= cumulativeAngle && angle < (cumulativeAngle + sliceAngle)) {
        setHoveredStatus(item);
        return;
      }
      
      cumulativeAngle = (cumulativeAngle + sliceAngle) % 360;
    }
  }
  
  setHoveredStatus(null);
};


useEffect(() => {
  drawPieChart();
}, [drawPieChart]);

  return (
    <div className="admin-stats-pie-container">
      <div className="pie-chart-wrapper">
        <canvas
          ref={canvasRef}
          width={250}  
          height={250} 
          className="admin-pie-chart"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredStatus(null)}
        />
        
  
        {hoveredStatus && (
          <div className="pie-tooltip">
            <strong>{hoveredStatus.status.toUpperCase()}</strong>
            <div>{hoveredStatus.count} ({((hoveredStatus.count / totalComplaints) * 100).toFixed(1)}%)</div>
          </div>
        )}
      </div>
      
 
      <div className="pie-legend">
        {statusData.map(item => (
          item.count > 0 && (
            <div key={item.status} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: item.color }} />
              <span>{item.status.replace(/^w/, c => c.toUpperCase())} ({item.count})</span>
            </div>
          )
        ))}
      </div>
      
      <div className="pie-total">Total: <strong>{totalComplaints}</strong></div>
    </div>
  );
};

export default AdminStatsPieChart;