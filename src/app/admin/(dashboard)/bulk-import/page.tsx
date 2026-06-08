'use client';

import React, { useState, useTransition } from 'react';
import Papa from 'papaparse';
import styles from './bulkImport.module.css';
import { importOfflineDonors } from '@/app/admin/importOfflineDonors';

// Graceful Degradation: Error Boundary wrapper
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, errorMsg: string}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#0D0F12', border: '1px solid #EF4444', borderRadius: '16px', maxWidth: '600px', margin: '2rem auto' }}>
          <h2 style={{ color: '#EF4444', margin: '0 0 1rem 0' }}>Critical UI Error</h2>
          <p style={{ color: '#9CA3AF' }}>The application caught an unexpected error: {this.state.errorMsg}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#fff', color: '#000', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}>Reload Dashboard</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function BulkImportContent() {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = () => {
    if (!file) return;
    setError(null);
    setIsParsing(true); // Double submit & loading state lock

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const h = header.toLowerCase().trim();
        if (h === 'full name' || h === 'name') return 'name';
        if (h === 'phone number' || h === 'phone' || h === 'phone no') return 'phone';
        if (h === 'amount' || h === 'monthlypledge' || h === 'monthly pledge') return 'monthlyPledge';
        return h; // keep others as is
      },
      complete: (result) => {
        setIsParsing(false);
        // Filter out rows that don't have a name or phone (e.g., summary rows or spacing rows)
        const data = result.data.filter((row: any) => {
          return row.name && String(row.name).trim() !== '' && row.phone && String(row.phone).trim() !== '';
        });
        
        if (!data || data.length === 0) {
          setError('CSV is empty or invalid format.');
          return;
        }

        // Pre-flight Malformed Data UI Validation
        for (let i = 0; i < data.length; i++) {
          const row: any = data[i];
          const amount = Number(row.monthlyPledge);
          if (isNaN(amount) || amount < 0) {
            setError(`Validation Error: Row ${i + 1} has a malformed 'monthlyPledge'. Found text instead of a number.`);
            return;
          }
          if (!row.phone || row.phone.trim().length < 10) {
            setError(`Validation Error: Row ${i + 1} has a missing or malformed phone number.`);
            return;
          }
        }

        // Hand off to strict Server Action
        startTransition(async () => {
          try {
            const response = await importOfflineDonors(data);
            if (response.success) {
              setResults(response.results);
            }
          } catch (err: any) {
            setError(err.message || 'Import failed due to an unknown server error.');
          }
        });
      },
      error: (err) => {
        setIsParsing(false);
        setError(`CSV Parser Error: ${err.message}. Please check the file format.`);
      }
    });
  };

  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  const submitLocked = !file || isPending || isParsing;

  return (
    <div className={styles.dashboardShell}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.mainTitle}>Bulk CSV Import</h1>
          <p className={styles.subtitle}>Upload offline donors and generate secure claim links.</p>
        </div>
      </header>

      {!results && (
        <div className={styles.bentoCard}>
          <div className={styles.fileInputArea}>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              id="csv-upload" 
            />
            <label htmlFor="csv-upload" style={{ cursor: 'pointer', display: 'block' }}>
              {file ? file.name : 'Click to select CSV file'}
              <br />
              <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Required headers: name, phone, monthlyPledge</span>
            </label>
          </div>

          <button 
            className={styles.submitBtn} 
            onClick={handleImport} 
            disabled={submitLocked}
          >
            {isParsing ? 'Validating CSV...' : isPending ? 'Processing & Committing...' : 'Upload & Process'}
          </button>
          
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginTop: '1.5rem' }}>
            <p style={{ color: '#EF4444', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{error}</p>
          </div>}
        </div>
      )}

      {results && (
        <div className={styles.successBentoCard}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#10B981' }}>Import Successful</h2>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>{results.length} accounts created safely and tokens generated.</p>
          </div>
          <div className={styles.tableResponsiveWrapper}>
            <table className={styles.cleanTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const encodedMessage = encodeURIComponent(`Welcome to Kingdom Builders, ${r.name}! Thank you for your Pledge towards the RCCG The King's House Youth Church Building Project. Please click this secure, one-time link to claim your dashboard and set up your private password: ${domain}/claim?token=${r.claimToken}`);
                  // Strict stripping for wa.me API linking
                  let phone = r.phone.replace(/[^0-9]/g, '');
                  if (phone.startsWith('0')) {
                    phone = '234' + phone.substring(1);
                  }
                  
                  const waUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

                  return (
                    <tr key={i} className={styles.tableRow}>
                      <td>{r.name}</td>
                      <td>{r.phone}</td>
                      <td style={{ color: r.status === 'SUCCESS' ? '#10B981' : '#EF4444', fontWeight: 600, fontSize: '0.85rem' }}>
                        {r.status === 'SUCCESS' ? 'Ready' : r.error}
                      </td>
                      <td>
                        {r.status === 'SUCCESS' && (
                          <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>
                            Send Invite
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BulkImportPage() {
  return (
    <ErrorBoundary>
      <BulkImportContent />
    </ErrorBoundary>
  );
}
