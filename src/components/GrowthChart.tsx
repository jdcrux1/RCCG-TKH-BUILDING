'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface GrowthChartProps {
  data: { month: string; amount: number }[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  // If no data, show placeholder
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: '300px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        opacity: 0.5 
      }}>
        No contribution history available yet.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--primary)', 
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              color: 'white'
            }}
            itemStyle={{ color: 'var(--accent)' }}
            formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Amount']}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="var(--secondary)" 
            fillOpacity={1} 
            fill="url(#colorAmount)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
