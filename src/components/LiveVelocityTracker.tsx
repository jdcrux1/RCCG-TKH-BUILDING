'use client';

import { useEffect, useState } from 'react';
import styles from './tracker.module.css';

interface LiveVelocityTrackerProps {
  currentRaised: number;
  targetGoal: number;
  monthlyVelocity: number;
}

export default function LiveVelocityTracker({ currentRaised, targetGoal, monthlyVelocity }: LiveVelocityTrackerProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const actualPercentage = Math.min((currentRaised / targetGoal) * 100, 100);

  useEffect(() => {
    let start = 0;
    const end = actualPercentage;
    if (end === 0) return;
    
    const duration = 1500; // 1.5 seconds
    const incrementTime = 30; // 30ms frames
    const step = (end - start) / (duration / incrementTime);

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayPercentage(end);
        clearInterval(timer);
      } else {
        setDisplayPercentage(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [actualPercentage]);

  // Predictive Targeting Logic
  const remainingAmount = targetGoal - currentRaised;
  
  let velocityElement;
  
  if (remainingAmount <= 0) {
    velocityElement = (
      <span className={styles.onTrack}>
        ₦650M Target Accomplished!
      </span>
    );
  } else if (monthlyVelocity > 0) {
    const monthsToTarget = remainingAmount / monthlyVelocity;
    const now = new Date();
    const completionDate = new Date(now.getFullYear(), now.getMonth() + Math.ceil(monthsToTarget), 1);
    const monthName = completionDate.toLocaleString('default', { month: 'long' });
    const year = completionDate.getFullYear();

    let currentPaceFormatted = '';
    if (monthlyVelocity >= 1000000) {
      currentPaceFormatted = `${(monthlyVelocity / 1000000).toFixed(1)}M`;
    } else {
      currentPaceFormatted = `${Math.ceil(monthlyVelocity).toLocaleString()}`;
    }

    velocityElement = (
      <div className={styles.predictiveBlock}>
        <div className={styles.projectedDate}>Projected ₦650M Target: <span className={styles.highlightDate}>{monthName} {year}</span></div>
        <div className={styles.paceSubtext}>Based on current pace of ₦{currentPaceFormatted}/mo</div>
      </div>
    );
  } else {
    velocityElement = (
      <div className={styles.predictiveBlock}>
        <div className={styles.projectedDate}>Projected ₦650M Target: <span className={styles.highlightDate}>Action Required</span></div>
        <div className={styles.paceSubtext}>Current 30-day velocity is ₦0</div>
      </div>
    );
  }

  return (
    <div className={styles.trackerWrapper}>
      <div className={styles.trackerShell}>
        
        <div className={`${styles.zone} ${styles.zoneDivider}`}>
          <div className={styles.liveIndicator} />
          <span className={styles.visionText}>Vision 2028</span>
        </div>

        <div className={`${styles.zone} ${styles.zoneDivider}`}>
          <span className={styles.fundedText}>
            <span className={styles.fundedPercentage}>{displayPercentage.toFixed(1)}%</span> Funded
          </span>
        </div>

        <div className={styles.zone}>
          <div className={styles.velocityText}>
            {velocityElement}
          </div>
        </div>

      </div>
    </div>
  );
}
