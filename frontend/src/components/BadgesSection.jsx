import '../Contributor.css';

const ALL_BADGES = [
  { id: 'first_contribution', name: 'First Step',           description: 'Made your first contribution',        icon: '🌱' },
  { id: 'consistent_5',       name: 'Consistent Supporter', description: 'Contributed 5 times',                  icon: '⭐' },
  { id: 'consistent_10',      name: 'Dedicated Citizen',    description: 'Contributed 10 times',                 icon: '🏅' },
  { id: 'consistent_25',      name: 'Community Champion',   description: 'Contributed 25 times',                 icon: '🏆' },
  { id: 'amount_1000',        name: 'Bronze Donor',         description: 'Contributed ₹1,000 total',             icon: '🥉' },
  { id: 'amount_5000',        name: 'Silver Donor',         description: 'Contributed ₹5,000 total',             icon: '🥈' },
  { id: 'amount_10000',       name: 'Gold Donor',           description: 'Contributed ₹10,000 total',            icon: '🥇' },
  { id: 'amount_50000',       name: 'Diamond Patron',       description: 'Contributed ₹50,000 total',            icon: '💎' },
  { id: 'multi_category',     name: 'All-Rounder',          description: 'Contributed to 3+ categories',         icon: '🌐' },
  { id: 'issue_resolver',     name: 'Issue Resolver',       description: 'Contributed to a fully-funded issue',  icon: '✅' },
];

const BadgesSection = ({ earnedBadges = [] }) => {
  const earnedMap = {};
  earnedBadges.forEach(b => { earnedMap[b.id] = b; });

  return (
    <div className="section-card">
      <h2 className="section-title">🎖 Your Badges</h2>
      <div className="badges-grid">
        {ALL_BADGES.map(badge => {
          const earned = earnedMap[badge.id];
          return (
            <div key={badge.id} className={`badge-card${earned ? ' earned' : ''}`}>
              <div className={earned ? 'badge-icon' : 'badge-locked-icon'}>{badge.icon}</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-desc">{badge.description}</div>
              {earned && (
                <div className="badge-earned-at">
                  {new Date(earned.earnedAt).toLocaleDateString()}
                </div>
              )}
              {!earned && (
                <div style={{ fontSize: '0.68rem', color: '#6e7a99', marginTop: '0.3rem' }}>Locked 🔒</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesSection;
