export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Target, Award, CheckCircle2, CalendarDays, Flame, Quote, Users, Landmark, Copy, Info } from 'lucide-react';
import TaxReceiptButton from '@/components/TaxReceiptButton';
import LogPaymentInstructionsButton from '@/components/LogPaymentInstructionsButton';
import PaymentClaimForm from './PaymentClaimForm';
import BankDetailsBanner from '@/components/BankDetailsBanner';
import MilestonesTimeline from '@/components/MilestonesTimeline';
import AutoRefresh from '@/components/AutoRefresh';
import { getTierColor } from '@/lib/tiers';
import styles from './dashboard.module.css';

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
    include: { 
      contributions: true,
      paymentClaims: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!donor) redirect('/login');

  const totalContributed = donor.contributions.reduce((sum, c) => sum + BigInt(c.amount), BigInt(0));
  const fulfillmentRate = donor.totalPledged > BigInt(0) ? (Number(totalContributed) / Number(donor.totalPledged)) * 100 : 0;

  // Schedule-Aware Pledge-Credit Streak Calculation (Flawless Prepayment & Catch-up rewards)
  let streak = 0;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyPledgeKobo = Number(donor.monthlyPledge);
  const totalGivenKobo = Number(totalContributed);
  const sortedContributions = [...donor.contributions].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  if (monthlyPledgeKobo > 0) {
    const startYear = donor.startDate.getFullYear();
    const startMonth = donor.startDate.getMonth();
    
    // Calculate total elapsed months since pledge start (at least 1)
    const elapsedMonths = Math.max(1, 
      (currentYear - startYear) * 12 + (currentMonth - startMonth) + 1
    );
    
    // Expected amount by today to be fully caught up
    const expectedAccumulatedKobo = elapsedMonths * monthlyPledgeKobo;
    
    if (totalGivenKobo >= expectedAccumulatedKobo) {
      // If fully paid or paid ahead, grant maximum elapsed months as streak
      streak = elapsedMonths;
    } else {
      // If lagging, count how many months of pledges their total contributions cover
      const coveredMonths = Math.floor(totalGivenKobo / monthlyPledgeKobo);
      
      // Fallback: Check standard consecutive transaction months in case they started active contributions recently
      let consecutiveActiveMonths = 0;
      let checkMonth = currentMonth;
      let checkYear = currentYear;
      
      while (true) {
        const gaveInMonth = sortedContributions.some(c => 
          c.date.getMonth() === checkMonth && c.date.getFullYear() === checkYear
        );
        if (gaveInMonth) {
          consecutiveActiveMonths++;
          checkMonth--;
          if (checkMonth < 0) {
            checkMonth = 11;
            checkYear--;
          }
        } else {
          if (consecutiveActiveMonths === 0 && checkMonth === currentMonth && checkYear === currentYear) {
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
      
      streak = Math.max(coveredMonths, consecutiveActiveMonths);
    }
  } else {
    // Supporter/one-off fallback: use standard consecutive monthly transaction count
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
  }

  const gaveThisMonth = sortedContributions.some(c => c.date.getMonth() === currentMonth && c.date.getFullYear() === currentYear);

  // Milestones
  const milestones = await prisma.milestone.findMany({
    orderBy: { order: 'asc' }
  });
  
  const currentMilestone = milestones.find(m => m.status !== 'FUNDED') || milestones[milestones.length - 1];
  const remainingForMilestone = currentMilestone ? currentMilestone.targetAmount - currentMilestone.currentAmount : BigInt(0);
  const donorsNeeded = donor.monthlyPledge > BigInt(0) && currentMilestone ? Math.ceil(Number(remainingForMilestone) / Number(donor.monthlyPledge)) : 0;

  // Impact Card Calculation
  const personalImpactPercentage = currentMilestone && currentMilestone.targetAmount > BigInt(0) 
    ? (Number(totalContributed) / Number(currentMilestone.targetAmount)) * 100 
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

  // Global Progress
  const totalTargetVar = await prisma.systemVariable.findUnique({ where: { key: 'totalTarget' } });
  const globalTarget = BigInt(totalTargetVar?.value || '65000000000'); // 650M Naira in Kobo
  const globalApprovedTotal = await prisma.contribution.aggregate({
    _sum: { amount: true }
  });
  const globalTotal = globalApprovedTotal._sum.amount || BigInt(0);
  const globalProgress = Number((globalTotal * BigInt(100)) / globalTarget);

  return { 
    donor, 
    totalContributed, 
    fulfillmentRate, 
    sortedContributions,
    streak,
    gaveThisMonth,
    currentMilestone,
    milestones,
    donorsNeeded,
    personalImpactPercentage,
    encouragement,
    confettiItems,
    globalTotal,
    globalTarget,
    globalProgress
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
    confettiItems,
    milestones,
    globalTotal,
    globalTarget,
    globalProgress
  } = await getDonorData();

  const isFulfilled = fulfillmentRate >= 100;
  const showCelebration = fulfillmentRate >= 25;
  const fulfillmentDash = Math.min(fulfillmentRate, 100) * 3.14;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', position: 'relative' }}>
      <AutoRefresh />
      
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
          <LogPaymentInstructionsButton />
          {totalContributed > BigInt(0) && <TaxReceiptButton donorName={donor.name} totalContributed={Number(totalContributed)} />}
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

      <div className={styles.dashboardLayout}>
        {/* LEFT COLUMN: ACTION & HISTORY */}
        <div className={styles.primaryColumn}>
          {/* PHASE 3: Log a Payment Form & Status */}
          <div className={styles.paymentFormCard}>
            <h3 className={styles.sectionHeader}>
              <Landmark size={20} color="var(--tier-primary)" />
              Log a New Payment
            </h3>
            <PaymentClaimForm monthlyPledge={Number(donor.monthlyPledge)} tierColor={getTierColor(donor.tier)} />
          </div>

          <div className={styles.ledgerSection}>
            {/* Contribution Timeline */}
            <div className="glass-card">
              <div className={styles.sectionHeader}>
                <CalendarDays size={20} color="var(--tier-primary)" />
                Recent Contributions
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedContributions.length > 0 ? sortedContributions.slice(0, 5).map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: i < 4 ? '1px solid var(--glass-border)' : 'none' }}>
                    <div>
                      <p style={{ fontWeight: '500' }}>₦{(Number(c.amount) / 100).toLocaleString()}</p>
                      <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(c.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px' }}>Logged</span>
                  </div>
                )) : (
                  <p style={{ opacity: 0.5, textAlign: 'center', padding: '2rem 0' }}>No contributions recorded yet.</p>
                )}
              </div>
            </div>

            <div className="glass-card">
              <h3 className={styles.sectionHeader}>Pending Verifications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {donor.paymentClaims?.length > 0 ? donor.paymentClaims.map((claim) => (
                  <div key={claim.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>₦{(Number(claim.amount) / 100).toLocaleString()}</p>
                      <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>{new Date(claim.date).toLocaleDateString()}</p>
                    </div>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      padding: '3px 8px', 
                      borderRadius: '4px',
                      background: claim.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : claim.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: claim.status === 'PENDING' ? '#f59e0b' : claim.status === 'APPROVED' ? 'var(--success)' : '#ef4444',
                      border: `1px solid ${claim.status === 'PENDING' ? '#f59e0b' : claim.status === 'APPROVED' ? 'var(--success)' : '#ef4444'}`
                    }}>
                      {claim.status}
                    </span>
                  </div>
                )) : (
                  <p style={{ fontSize: '0.85rem', opacity: 0.5, textAlign: 'center' }}>No recent payment claims.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: VISION & QUOTES */}
        <div className={styles.secondaryColumn}>
          {/* Dynamic Interactive Construction Milestones Timeline */}
          <div className={styles.milestoneTracker}>
            <MilestonesTimeline 
              milestones={milestones.map(m => ({
                ...m,
                targetAmount: Number(m.targetAmount),
                currentAmount: Number(m.currentAmount)
              }))} 
              currentMilestoneId={currentMilestone?.id} 
            />
          </div>

          {/* Giving Streak & Encouragement */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255,100,100,0.1)', padding: '12px', borderRadius: '50%' }}>
                <Flame size={32} color={streak > 0 ? '#ff6b6b' : 'rgba(255,255,255,0.2)'} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', color: streak > 0 ? '#ff6b6b' : 'inherit' }}>{streak} Month Streak</h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Your faithfulness is inspiring.</p>
              </div>
            </div>

            <div className={styles.quoteCard}>
              <Quote size={32} color="var(--tier-primary)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', opacity: 0.9 }}>&ldquo;{encouragement}&rdquo;</p>
              <p className={styles.subText} style={{ marginTop: '1rem' }}>A word for you this week.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
