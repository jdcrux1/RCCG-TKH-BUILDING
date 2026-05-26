'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp, Flag, Award, Circle } from 'lucide-react';

type Milestone = {
  id: string;
  title: string;
  targetAmount: bigint;
  currentAmount: bigint;
  status: string;
  order: number;
};

const milestoneDescriptions: Record<string, string> = {
  'basement': 'Phase 1: Structural foundation, retaining walls, & secure underground basement parking citadel.',
  'ground-floor': 'Phase 2: Ground floor sanctuary building featuring a massive 2,000+ seat auditorium & main altar layout.',
  'first-floor': 'Phase 3: First-floor gallery elevation, youth church halls, administrative suites, & VIP facilities.'
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring', stiffness: 80 }
  }
};

export default function MilestonesTimeline({ 
  milestones, 
  currentMilestoneId 
}: { 
  milestones: Milestone[]; 
  currentMilestoneId: string | undefined;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(currentMilestoneId || null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Construction Milestones</h3>
        <p style={{ fontSize: '0.8rem', opacity: 0.5, margin: '4px 0 0 0' }}>
          Chronological progress of the sanctuary building phases.
        </p>
      </div>

      <div style={{ position: 'relative', paddingLeft: '32px', marginTop: '8px' }}>
        {/* Vertical Progress Line */}
        <div style={{ 
          position: 'absolute', left: '7px', top: '12px', bottom: '16px', 
          width: '2px', background: 'rgba(255, 255, 255, 0.08)' 
        }} />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}
        >
          {milestones.map((ms) => {
            const isCompleted = ms.status === 'FUNDED' || ms.status === 'COMPLETED';
            const isCurrent = ms.id === currentMilestoneId;
            const isExpanded = expandedId === ms.id;
            
            const fundedPercent = ms.targetAmount > BigInt(0)
              ? Number((ms.currentAmount * BigInt(100)) / ms.targetAmount)
              : 0;

            const outstanding = ms.targetAmount - ms.currentAmount;

            return (
              <motion.div 
                key={ms.id} 
                variants={itemVariants}
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => toggleExpand(ms.id)}
              >
                {/* Node Dot with pulse animation for current phase */}
                <div style={{ position: 'absolute', left: '-31px', top: '4px', zIndex: 10 }}>
                  {isCompleted ? (
                    <div style={{ 
                      width: '16px', height: '16px', borderRadius: '50%', 
                      background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '3px solid var(--primary)', boxShadow: '0 0 10px rgba(16,185,129,0.3)'
                    }}>
                      <CheckCircle2 size={10} color="black" style={{ flexShrink: 0 }} />
                    </div>
                  ) : isCurrent ? (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      style={{ 
                        width: '16px', height: '16px', borderRadius: '50%', 
                        background: 'var(--accent)', border: '3px solid var(--primary)',
                        boxShadow: '0 0 12px var(--accent)'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      width: '16px', height: '16px', borderRadius: '50%', 
                      background: '#1e293b', border: '3px solid var(--primary)'
                    }} />
                  )}
                </div>

                {/* Milestone Details Card */}
                <div style={{ 
                  background: isCurrent ? 'rgba(245, 158, 11, 0.02)' : 'transparent',
                  border: isCurrent ? '1px solid rgba(245, 158, 11, 0.08)' : '1px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  transition: 'background 0.3s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ 
                        fontWeight: 'bold', 
                        fontSize: '0.95rem',
                        color: isCompleted || isCurrent ? 'white' : 'rgba(255,255,255,0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {ms.title}
                        {isCurrent && (
                          <span style={{ 
                            fontSize: '0.6rem', padding: '1px 6px', borderRadius: '4px',
                            background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent)',
                            fontWeight: 'bold'
                          }}>ACTIVE</span>
                        )}
                      </span>
                      <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '2px 0 0 0' }}>
                        {milestoneDescriptions[ms.id] ? milestoneDescriptions[ms.id].slice(0, 52) + '...' : 'Phase Milestone'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{fundedPercent}%</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Collapsible details using Framer Motion */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 10 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden', borderTop: '1px dashed var(--glass-border)', paddingTop: '10px' }}
                      >
                        <p style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: '1.4', margin: '0 0 10px 0' }}>
                          {milestoneDescriptions[ms.id] || "Project campaign phase construction milestone details."}
                        </p>

                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '8px', 
                          fontSize: '0.75rem',
                          background: 'rgba(0,0,0,0.15)',
                          padding: '10px',
                          borderRadius: '6px'
                        }}>
                          <div>
                            <span style={{ opacity: 0.5, display: 'block' }}>Target Goal</span>
                            <strong style={{ fontSize: '0.85rem' }}>₦{(Number(ms.targetAmount) / 100).toLocaleString()}</strong>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ opacity: 0.5, display: 'block' }}>Funded To Date</span>
                            <strong style={{ fontSize: '0.85rem', color: isCompleted ? 'var(--success)' : 'var(--accent)' }}>
                              ₦{(Number(ms.currentAmount) / 100).toLocaleString()}
                            </strong>
                          </div>
                          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '2px' }}>
                            <span style={{ opacity: 0.5, display: 'block' }}>Outstanding Balance</span>
                            <strong style={{ fontSize: '0.85rem', color: outstanding <= BigInt(0) ? 'var(--success)' : '#ff6b6b' }}>
                              {outstanding <= BigInt(0) ? 'Fully Funded' : `₦${(Number(outstanding) / 100).toLocaleString()}`}
                            </strong>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
