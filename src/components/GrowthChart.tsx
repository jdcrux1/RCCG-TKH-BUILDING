'use client';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ProgressRing({ 
  percentage, 
  size = 120, 
  strokeWidth = 8,
  color = 'var(--accent)'
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: size / 4,
        fontWeight: 'bold',
        color: 'white'
      }}>
        {percentage.toFixed(0)}%
      </div>
    </div>
  );
}

interface ProgressBarProps {
  percentage: number;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ 
  percentage, 
  height = 24,
  showLabel = true 
}: ProgressBarProps) {
  const clampedPercent = Math.min(100, Math.max(0, percentage));
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        height,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: height / 2,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: `${clampedPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--accent), var(--secondary))',
          borderRadius: height / 2,
          transition: 'width 0.5s ease-out'
        }} />
        {showLabel && (
          <span style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: Math.max(10, height / 2.5),
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            {clampedPercent.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

interface GrowthChartData {
  month: string;
  amount: number;
}

interface AreaChartCSSProps {
  data: GrowthChartData[];
}

function formatNaira(amount: number): string {
  if (amount >= 1000000000) return `₦${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
  return `₦${amount}`;
}

export function AreaChartCSS({ data }: AreaChartCSSProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: 250, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        opacity: 0.5 
      }}>
        No contribution history available yet.
      </div>
    );
  }

  const validAmounts = data.map(d => d.amount).filter(a => a > 0);
  const maxAmount = validAmounts.length > 0 ? Math.max(...validAmounts) : 1;
  const minHeight = 4;

  return (
    <div style={{ 
      width: '100%', 
      height: 250, 
      display: 'flex', 
      alignItems: 'flex-end', 
      justifyContent: 'space-between', 
      gap: 8,
      padding: '16px 8px'
    }}>
      {data.map((item, i) => {
        const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
        const barHeight = Math.max(percentage, item.amount > 0 ? (minHeight / 250) * 100 : 0);
        
        return (
          <div 
            key={i} 
            style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              height: '100%', 
              justifyContent: 'flex-end',
              position: 'relative'
            }}
            title={`${item.month}: ${formatNaira(item.amount)}`}
          >
            <div style={{
              width: '100%',
              height: `${barHeight}%`,
              background: item.amount > 0 
                ? 'linear-gradient(180deg, var(--secondary) 0%, rgba(99,102,241,0.4) 100%)'
                : 'rgba(255,255,255,0.1)',
              borderRadius: '4px 4px 0 0',
              minHeight: item.amount > 0 ? 4 : 2,
              transition: 'all 0.3s ease-out',
              cursor: 'pointer'
            }}>
              {item.amount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: -24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 11,
                  whiteSpace: 'nowrap',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  opacity: 0.9,
                  pointerEvents: 'none'
                }}>
                  {formatNaira(item.amount)}
                </div>
              )}
            </div>
            <div style={{ 
              marginTop: 8, 
              fontSize: 12, 
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}>
              {item.month}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AreaChartCSS;