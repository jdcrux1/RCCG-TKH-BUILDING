'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './RevealOnScroll.module.css';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export default function RevealOnScroll({ children, className = '', threshold = 0.1 }: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = domRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target); // Memory safe: stop observing once revealed
          }
        });
      },
      { threshold }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <div
      ref={domRef}
      className={`${styles.revealItem} ${isVisible ? styles.isVisible : ''} ${className}`}
    >
      {children}
    </div>
  );
}
