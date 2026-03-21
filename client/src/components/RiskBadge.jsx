// RiskBadge — HIGH / MEDIUM / LOW risk level badge
const RISK_STYLES = {
  HIGH:   'risk-high',
  MEDIUM: 'risk-medium',
  LOW:    'risk-low',
};

export default function RiskBadge({ level }) {
  return (
    <span className={`risk-badge ${RISK_STYLES[level] || 'risk-low'}`}>
      {level}
    </span>
  );
}
