import React from "react";

const EmptyState = ({ onReport }) => {
  return (
    <section className="citizen-empty-state">
      <h2>Welcome to CivicCare</h2>
      <p>
        You haven&apos;t reported any issues yet.  
        See something broken, unsafe or not working in your area?
      </p>
      <p>
        Raise a complaint here and your local council will review it and work
        towards a resolution.
      </p>

      <button
        type="button"
        className="empty-report-btn"
        onClick={onReport}
      >
        <span className="empty-report-plus">+</span>
        Report an issue in your area
      </button>
    </section>
  );
};

export default EmptyState;
