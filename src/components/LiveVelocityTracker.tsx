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

  // Velocity Logic
  const remainingAmount = targetGoal - currentRaised;
  
  const now = new Date();
  const targetDate = new Date('2028-12-31');
  const totalMonthsLeft = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
  const requiredVelocity = totalMonthsLeft > 0 ? remainingAmount / totalMonthsLeft : remainingAmount;

  const isOnTrack = monthlyVelocity >= requiredVelocity;
  
  let velocityElement;
  
  if (remainingAmount <= 0) {
    velocityElement = (
      <span className={styles.onTrack}>
        Goal Accomplished!
      </span>
    );
  } else if (isOnTrack && monthlyVelocity > 0) {
    const monthsToFinish = remainingAmount / monthlyVelocity;
    const completionDate = new Date(now.getFullYear(), now.getMonth() + Math.ceil(monthsToFinish), 1);
    const monthName = completionDate.toLocaleString('default', { month: 'short' });
    const year = completionDate.getFullYear();
    velocityElement = (
      <span className={styles.onTrack}>
        Estimated Completion: {monthName} {year} (On Target)
      </span>
    );
  } else {
    let paceFormatted = '';
    if (requiredVelocity >= 1000000) {
      paceFormatted = `₦${(requiredVelocity / 1000000).toFixed(1)}M`;
    } else {
      paceFormatted = `₦${Math.ceil(requiredVelocity).toLocaleString()}`;
    }

    velocityElement = (
      <span className={styles.offTrack}>
        Required Pace: {paceFormatted}/month to reach ₦650M Goal
      </span>
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
