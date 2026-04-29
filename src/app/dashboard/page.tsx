export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Target, Award, CheckCircle2, CalendarDays, Flame, Quote, Users } from 'lucide-react';
import TaxReceiptButton from '@/components/TaxReceiptButton';

// Encouragement Messages
const encouragements = [
  "Your generosity builds His kingdom.",
  "Every stone laid is a testament to faith.",
  "Together, we are doing a great work.",
  "God loves a cheerful giver.",
  "Thank you for your steadfast commitment.",
  "Your faithfulness leaves a legacy."
];

async function getDonorData() {
  const session = await getSession();
  if (!session) redirect('/login');

  const donor = await prisma.donor.findUnique({
    where: { id: session.userId },
    include: { contributions: true }
  });

  if (!donor) redirect('/login');

  // Only count VERIFIED contributions
  const verifiedContributions = donor.contributions.filter(c => c.status === 'VERIFIED');
  const totalContributed = verifiedContributions.reduce((sum, c) => sum + c.amount, 0);
  const fulfillmentRate = donor.totalPledged > 0 ? (totalContributed / donor.totalPledged) * 100 : 0;

  // Streak Calculation
  let streak = 0;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const sortedContributions = [...verifiedContributions].sort((a, b) => b.date.getTime() - a.date.getTime());
  let checkMonth = currentMonth;
  let checkYear = currentYear;
  
  while (true) {
    const gaveInMonth = sortedContributions.some(c => 
      c.date.getMonth() === checkMonth && c.date.getFullYear() === checkYear
    );
    if (gaveInMonth) {
      streak++;
      checkMonth--;
      if (checkMonth < 0) {
        checkMonth = 11;
        checkYear--;
      }
    } else {
      if (streak === 0 && checkMonth === currentMonth && checkYear === currentYear) {
        checkMonth--;
        if (checkMonth < 0) {
          checkMonth = 11;
          checkYear--;
        }
        continue;
      }
      break;
    }
  }

  const gaveThisMonth = sortedContributions.some(c => c.date.getMonth() === currentMonth && c.date.getFullYear() === currentYear);

  // Milestones
  const milestones = await prisma.milestone.findMany({
    orderBy: { order: 'asc' }
  });
  
  const currentMilestone = milestones.find(m => m.status !== 'FUNDED') || milestones[milestones.length - 1];
  const remainingForMilestone = currentMilestone ? currentMilestone.targetAmount - currentMilestone.currentAmount : 0;
  const donorsNeeded = donor.monthlyPledge > 0 && currentMilestone ? Math.ceil(remainingForMilestone / donor.monthlyPledge) : 0;

  // Impact Card Calculation
  const personalImpactPercentage = currentMilestone && currentMilestone.targetAmount > 0 
    ? (totalContributed / currentMilestone.targetAmount) * 100 
    : 0;

  // Encouragement
  const currentWeek = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
  const encouragement = encouragements[currentWeek % encouragements.length];

  // Confetti pre-computed positions (Server Components can't use Math.random in JSX)
  const confettiItems = Array.from({ length: 30 }, (_, i) => ({
    left: ((i * 37 + 13) % 100),
    delay: ((i * 0.07) % 2),
    scale: 0.5 + ((i * 0.03) % 1),
  }));

  return { 
    donor, 
    totalContributed, 
    fulfillmentRate, 
    sortedContributions,
    streak,
    gaveThisMonth,
    currentMilestone,
    donorsNeeded,
    personalImpactPercentage,
    encouragement,
    confettiItems
  };
}

export default async function DonorDashboard() {
  const { 
    donor, 
    totalContributed, 
    fulfillmentRate, 
    sortedContributions,
    streak,
    gaveThisMonth,
    currentMilestone,
    donorsNeeded,
    personalImpactPercentage,
    encouragement,
    confettiItems
  } = await getDonorData();

  const showCelebration = fulfillmentRate >= 25;
  const fulfillmentDash = Math.min(fulfillmentRate, 100) * 3.14;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', position: 'relative' }}>
      
      {/* CSS Confetti Celebration */}
      {showCelebration && (
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes confetti-fall {
              0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            .confetti {
              position: fixed;
              top: 0;
              width: 10px;
              height: 10px;
              background: var(--tier-primary);
              animation: confetti-fall 3s ease-in forwards;
              z-index: 1000;
              pointer-events: none;
            }
          `}} />
          {confettiItems.map((item, i) => (
            <div 
              key={i} 
              className="confetti" 
              style={{ 
                left: `${item.left}vw`, 
                animationDelay: `${item.delay}s`,
                transform: `scale(${item.scale})`
              }} 
            />
          ))}
        </>
      )}

      {/* Header & Quick Actions */}
      <section style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            Welcome back, {donor.name}
            <span style={{
              fontSize: '0.9rem',
              padding: '4px 12px',
              background: 'var(--tier-primary)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius-full)',
              fontWeight: '600',
              boxShadow: '0 0 10px var(--tier-glow)'
            }}>
              {donor.tier}
            </span>
          </h1>
          <p style={{ opacity: 0.6 }}>Thank you for being a part of the Kingdom Builders family.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {totalContributed > 0 && <TaxReceiptButton donorName={donor.name} totalContributed={totalContributed} />}
        </div>
      </section>

      {/* Thank You / Prompt Banner */}
      {gaveThisMonth ? (
        <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem var(--space-md)' }}>
          <CheckCircle2 /> <span style={{ fontWeight: '500' }}>Thank you for your recent contribution this month!</span>
        </div>
      ) : (
        <div className="glass-card" style={{ background: 'var(--tier-glow)', borderColor: 'var(--tier-primary)', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem var(--space-md)' }}>
          <Target color="var(--tier-primary)" /> <span style={{ fontWeight: '500' }}>Your next contribution helps us reach the {currentMilestone?.title}!</span>
        </div>
      )}

      {/* Main Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: 'var(--space-md)' 
      }}>
        
        {/* Fulfillment Ring Card */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--tier-primary)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle 
                cx="60" cy="60" r="50" fill="none" 
                stroke="var(--tier-primary)" strokeWidth="8" 
                strokeDasharray={`${fulfillmentDash} 314`}
                strokeLinecap="round" 
                transform="rotate(-90 60 60)" 
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--tier-primary)' }}>{fulfillmentRate.toFixed(0)}%</span>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Pledge Fulfillment</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '4px' }}>Total Contributed: <strong style={{ color: 'white' }}>₦{totalContributed.toLocaleString()}</strong></p>
            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>24-Month Goal: <strong style={{ color: 'white' }}>₦{donor.totalPledged.toLocaleString()}</strong></p>
          </div>
        </div>

        {/* Giving Streak */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(255,100,100,0.1)', padding: '12px', borderRadius: '50%' }}>
              <Flame size={32} color={streak > 0 ? '#ff6b6b' : 'rgba(255,255,255,0.2)'} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.8rem', color: streak > 0 ? '#ff6b6b' : 'inherit' }}>{streak} Months</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>Consecutive Giving Streak</p>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>
            {streak > 0 ? "You're building an incredible habit of faithfulness!" : "Make a contribution this month to start your streak!"}
          </p>
        </div>

        {/* Impact Summary & Community Goal */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Users size={18} color="var(--tier-primary)" />
              <h3 style={{ fontSize: '1rem' }}>Community Impact</h3>
            </div>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '12px' }}>
              Your contributions have funded <strong>{personalImpactPercentage.toFixed(2)}%</strong> of the <span style={{ color: 'var(--tier-primary)' }}>{currentMilestone?.title}</span>.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '0.85rem' }}>
              We only need <strong style={{ color: 'var(--tier-primary)' }}>{donorsNeeded}</strong> more donors at your tier level to fully fund this phase!
            </p>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
        
        {/* Contribution Timeline */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
            <CalendarDays size={20} color="var(--tier-primary)" />
            <h3 style={{ fontSize: '1.2rem' }}>Recent Contributions</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedContributions.length > 0 ? sortedContributions.slice(0, 5).map((c, i) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: i < 4 ? '1px solid var(--glass-border)' : 'none' }}>
                <div>
                  <p style={{ fontWeight: '500' }}>₦{c.amount.toLocaleString()}</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(c.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px' }}>Verified</span>
              </div>
            )) : (
              <p style={{ opacity: 0.5, textAlign: 'center', padding: '2rem 0' }}>No contributions recorded yet.</p>
            )}
          </div>
        </div>

        {/* Weekly Encouragement */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, var(--tier-glow) 100%)' }}>
          <Quote size={40} color="var(--tier-primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '500', lineHeight: 1.4, marginBottom: '1rem' }}>
            &ldquo;{encouragement}&rdquo;
          </h2>
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>A word for you this week.</p>
        </div>

      </div>

    </div>
  );
}
