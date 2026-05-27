'use client';

import { Download } from 'lucide-react';

export default function TaxReceiptButton({ donorName, totalContributed }: { donorName: string, totalContributed: number }) {
  const handlePrint = () => {
    // Popup-blocker resistant native print execution
    window.print();
  };

  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <button 
        onClick={handlePrint}
        style={{
          background: 'transparent',
          border: '1px solid var(--tier-primary)',
          color: 'var(--foreground)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.boxShadow = '0 0 10px var(--tier-glow)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Download size={18} color="var(--tier-primary)" /> Download Receipt
      </button>

      {/* HIDDEN PRINT VIEW - HYDRATED LOCALLY TO PREVENT POPUP BLOCKING */}
      <div id="receipt-print-area" style={{ display: 'none' }}>
        <div style={{ borderBottom: '3px double #d97706', paddingBottom: '20px', marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ color: '#d97706', margin: 0, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RCCG The King&apos;s House</h1>
          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.05rem', color: '#333' }}>Kingdom Builders Building Project 2026-2028</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#555' }}>Sanctuary of Faith • Next Generation Church Citadel</p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#111', borderBottom: '1px solid #eee', paddingBottom: '8px', fontSize: '1.3rem', fontWeight: 'bold', marginTop: '20px' }}>Official Contribution Receipt</h2>
          
          <div className="tableResponsive"><table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', marginBottom: '20px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f1f1' }}>
                <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#666', width: '180px', fontSize: '0.9rem' }}>Date Issued:</td>
                <td style={{ padding: '10px 0', color: '#111', fontSize: '0.95rem' }}>{date}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f1f1' }}>
                <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#666', fontSize: '0.9rem' }}>Issued To (Partner):</td>
                <td style={{ padding: '10px 0', color: '#111', fontSize: '1.1rem', fontWeight: 'bold' }}>{donorName}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f1f1' }}>
                <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#666', fontSize: '0.9rem' }}>Campaign Area:</td>
                <td style={{ padding: '10px 0', color: '#111', fontSize: '0.95rem' }}>RCCG TKH Citadel Construction Fund</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f1f1' }}>
                <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#666', fontSize: '0.9rem' }}>Total Verified Giving:</td>
                <td style={{ padding: '10px 0', color: '#d97706', fontSize: '1.35rem', fontWeight: 'bold' }}>₦{totalContributed.toLocaleString()}</td>
              </tr>
            </tbody>
          </table></div>

          <p style={{ fontSize: '0.95rem', color: '#333', textIndent: '30px', marginTop: '25px', lineHeight: '1.6' }}>
            This document serves as an official receipt acknowledging that <strong>{donorName}</strong> has generously contributed a total verified sum of <strong>₦{totalContributed.toLocaleString()}</strong> towards the RCCG The King&apos;s House Building Project.
          </p>
          
          <p style={{ fontSize: '0.95rem', color: '#333', textIndent: '30px', marginTop: '12px', lineHeight: '1.6' }}>
            We express our deepest appreciation for your steadfast commitment, covenant partnership, and financial support. Your contribution is laying the physical foundations for Kingdom advancement and raising a lasting legacy for generations to come.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
          <div>
            <div style={{ height: '40px' }}></div>
            <div style={{ borderTop: '1px solid #999', width: '220px', textAlign: 'center', fontSize: '0.8rem', paddingTop: '4px', color: '#555' }}>
              Building Committee Secretariat
            </div>
          </div>
          <div>
            <div style={{ height: '40px' }}></div>
            <div style={{ borderTop: '1px solid #999', width: '220px', textAlign: 'center', fontSize: '0.8rem', paddingTop: '4px', color: '#555' }}>
              Parish Pastor / Authority
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#777', marginTop: '120px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
          <p style={{ margin: '2px 0' }}>RCCG The King&apos;s House is a registered religious assembly under the Redeemed Christian Church of God.</p>
          <p style={{ margin: '2px 0', fontWeight: 'bold' }}>Thank you for your Kingdom Legacy.</p>
        </div>
      </div>
    </>
  );
}
