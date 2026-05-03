export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Target, Award, CheckCircle2, CalendarDays, Flame, Quote, Users, Landmark, Copy, Info } from 'lucide-react';
import TaxReceiptButton from '@/components/TaxReceiptButton';
import PaymentClaimForm from './PaymentClaimForm';

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

  // Streak Calculation
  let streak = 0;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const sortedContributions = [...donor.contributions].sort((a, b) => b.date.getTime() - a.date.getTime());
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
          {totalContributed > BigInt(0) && <TaxReceiptButton donorName={donor.name} totalContributed={Number(totalContributed)} />}
        </div>
      </section>

      {/* 1. Personal Fulfillment Metrics */}
      <section className="glass-card" style={{ 
        position: 'relative',
        overflow: 'hidden',
        border: isFulfilled ? '2px solid #D4AF37' : '1px solid var(--glass-border)',
        background: isFulfilled ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0,0,0,0) 100%)' : 'var(--glass-bg)'
      }}>
        {isFulfilled && (
          <div style={{ 
            position: 'absolute', top: '12px', right: '12px',
            background: '#D4AF37', color: '#000', padding: '4px 12px',
            borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 'bold',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <Award size={14} /> PLEDGE COMPLETED
          </div>
        )}
        
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.8 }}>Your Personal Kingdom Legacy</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
          <span>Pledge Fulfillment</span>
          <span style={{ fontWeight: 'bold', color: isFulfilled ? '#D4AF37' : 'var(--tier-primary)' }}>{fulfillmentRate.toFixed(1)}%</span>
        </div>
        
        <div style={{ 
          height: '12px', width: '100%', background: 'rgba(255,255,255,0.05)', 
          borderRadius: '6px', overflow: 'hidden', marginBottom: '1.5rem' 
        }}>
          <div style={{ 
            height: '100%', width: `${Math.min(fulfillmentRate, 100)}%`, 
            background: isFulfilled ? 'linear-gradient(90deg, #D4AF37, #F9D71C)' : 'var(--tier-primary)',
            boxShadow: isFulfilled ? '0 0 10px #D4AF37' : 'none',
            transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase' }}>Verified Giving</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>₦{(Number(totalContributed) / 100).toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase' }}>24-Month Commitment</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', opacity: 0.9 }}>₦{(Number(donor.totalPledged) / 100).toLocaleString()}</p>
          </div>
        </div>
      </section>

      {/* PHASE 3: Bank Details Banner */}
      <section style={{ 
        background: 'linear-gradient(135deg, var(--tier-primary) 0%, #d97706 100%)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        color: 'var(--primary)',
        boxShadow: '0 10px 25px -5px var(--tier-glow)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Landmark size={28} />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Official Bank Transfer Details</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Use the details below for all your contributions.</p>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem',
          background: 'rgba(255,255,255,0.1)',
          padding: '1.2rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginBottom: '4px' }}>Bank Name</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Premium Trust Bank</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginBottom: '4px' }}>Account Number</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>0040239581</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginBottom: '4px' }}>Account Name</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>RCCG The King's House Building Project</p>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(0,0,0,0.4)', 
          padding: '1.5rem', 
          borderRadius: 'var(--radius-sm)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          border: '2px solid white',
          boxShadow: '0 0 20px rgba(255,255,255,0.3)',
          animation: 'pulse-border 2s infinite'
        }}>
          <div style={{ 
            background: 'white', color: 'var(--tier-primary)', 
            width: '40px', height: '40px', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
          }}>
            <Info size={24} />
          </div>
          <p style={{ fontSize: '1rem', lineHeight: '1.4' }}>
            <strong style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px', opacity: 0.8 }}>CRITICAL INSTRUCTION:</strong>
            You <span style={{ textDecoration: 'underline', fontWeight: '900' }}>MUST</span> include your Unique ID <strong style={{ fontSize: '1.4rem', color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>{donor.donorRefId || 'PENDING'}</strong> in the <strong>Narration/Description</strong> field of your bank transfer.
          </p>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse-border {
            0% { border-color: rgba(255,255,255,1); }
            50% { border-color: rgba(255,255,255,0.2); }
            100% { border-color: rgba(255,255,255,1); }
          }
        `}} />
      </section>

      {/* Technical Support */}
      <section className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', border: '1px solid #333' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Technical Support (WhatsApp/Text Only)</p>
        </div>
        <p style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--tier-primary)' }}>+234 812 345 6789</p>
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

      {/* 2. Global Vision Card */}
      <section className="glass-card" style={{ 
        background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(20,20,20,0.6) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>The Global Vision</h2>
            <p style={{ opacity: 0.6 }}>Total Church-wide Contributions</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--tier-primary)' }}>₦ {(Number(globalTotal) / 100).toLocaleString()}</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.4 }}>Target: ₦ {(Number(globalTarget) / 100).toLocaleString()}</p>
          </div>
        </div>

        <div style={{ position: 'relative', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '4px' }}>
          <div style={{ 
            height: '100%', width: `${globalProgress}%`, 
            background: 'linear-gradient(90deg, var(--tier-primary) 0%, #fbbf24 100%)',
            borderRadius: '16px',
            boxShadow: '0 0 20px var(--tier-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 'bold', color: 'black',
            transition: 'width 2s ease-out'
          }}>
            {globalProgress}%
          </div>
        </div>
      </section>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: 'var(--space-md)' 
      }}>
        
        {/* 3. Construction Milestones Timeline */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Construction Milestones</h3>
          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            {/* Vertical Spine */}
            <div style={{ 
              position: 'absolute', left: '7px', top: '10px', bottom: '10px', 
              width: '2px', background: 'rgba(255,255,255,0.1)' 
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {milestones.map((ms) => {
                const isCompleted = ms.status === 'FUNDED' || ms.status === 'COMPLETED';
                const isCurrent = ms.id === currentMilestone?.id;

                return (
                  <div key={ms.id} style={{ position: 'relative' }}>
                    {/* Node */}
                    <div style={{ 
                      position: 'absolute', left: '-31px', top: '4px',
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: isCompleted ? 'var(--tier-primary)' : isCurrent ? 'var(--tier-primary)' : '#333',
                      border: '4px solid #111',
                      zIndex: 2,
                      animation: isCurrent ? 'pulse-node 2s infinite' : 'none'
                    }}>
                      {isCompleted && <CheckCircle2 size={10} color="black" style={{ position: 'absolute', top: -1, left: -1 }} />}
                    </div>
                    
                    <style dangerouslySetInnerHTML={{ __html: `
                      @keyframes pulse-node {
                        0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
                      }
                    `}} />

                    <div>
                      <p style={{ 
                        fontWeight: 'bold', fontSize: '0.95rem', 
                        color: isCompleted || isCurrent ? 'white' : '#666' 
                      }}>{ms.title}</p>
                      <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>{ms.description || 'Phase Project Milestone'}</p>
                      {isCurrent && (
                        <span style={{ 
                          fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px',
                          background: 'rgba(212, 175, 55, 0.1)', color: 'var(--tier-primary)',
                          marginTop: '4px', display: 'inline-block'
                        }}>CURRENT PHASE</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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

          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <Quote size={32} color="var(--tier-primary)" style={{ opacity: 0.3, marginBottom: '1rem', alignSelf: 'center' }} />
            <p style={{ fontSize: '1.1rem', fontStyle: 'italic', opacity: 0.9 }}>&ldquo;{encouragement}&rdquo;</p>
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

        {/* PHASE 3: Log a Payment Form & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <PaymentClaimForm />
          
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Pending Verifications</h3>
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
