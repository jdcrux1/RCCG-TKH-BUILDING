'use client';

import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

type Data = {
  totalRaised: number;
  totalTarget: number;
  totalDonors: number;
  tierData: { name: string; value: number }[];
  trendData: { name: string; amount: number }[];
  name: string;
};

const COLORS = ['#d4af37', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#78350f'];

export default function ExecutiveDashboardClient({ data }: { data: Data }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const progressPercentage = Math.min((data.totalRaised / data.totalTarget) * 100, 100);

  const formatCurrency = (val: number) => `₦${val.toLocaleString()}`;

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: 'sans-serif', padding: '24px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#d4af37', margin: 0 }}>Executive Dashboard</h1>
          <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: '14px' }}>Welcome, {data.name}</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
        >
          Logout
        </button>
      </div>

      {/* TOP METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* TOTAL RAISED */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(10px)' }}>
          <h3 style={{ color: '#888', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0' }}>Total Contributed</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>{formatCurrency(data.totalRaised)}</div>
          <div style={{ marginTop: '16px', width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #d4af37, #fcd34d)', borderRadius: '4px' }}></div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#888', textAlign: 'right' }}>
            {progressPercentage.toFixed(1)}% of {formatCurrency(data.totalTarget)} Goal
          </div>
        </div>

        {/* TOTAL DONORS */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(10px)' }}>
          <h3 style={{ color: '#888', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0' }}>Kingdom Builders</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>{data.totalDonors.toLocaleString()}</div>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '16px' }}>Total members who have joined the vision</p>
        </div>

      </div>

      {/* CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* TIER BREAKDOWN (WHEEL) */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(10px)' }}>
          <h3 style={{ color: '#888', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 24px 0', textAlign: 'center' }}>Builders by Tier</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.tierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#d4af37' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MONTHLY TRENDS (BAR) */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(10px)' }}>
          <h3 style={{ color: '#888', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 24px 0', textAlign: 'center' }}>Contribution Trend</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(val) => `₦${(val/1000000).toFixed(1)}M`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                />
                <Bar dataKey="amount" fill="#d4af37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
