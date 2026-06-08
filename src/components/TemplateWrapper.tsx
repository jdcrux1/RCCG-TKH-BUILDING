'use client';

import React from 'react';
import styles from './TemplateWrapper.module.css';

interface TemplateWrapperProps {
  children: React.ReactNode;
}

export default function TemplateWrapper({ children }: TemplateWrapperProps) {
  return (
    <div className={styles.templateWrapper}>
      {/* The CRT/Film Grain Overlay */}
      <div className={styles.noiseOverlay} aria-hidden="true" />
      {/* The Main Content */}
      {children}
    </div>
  );
}
