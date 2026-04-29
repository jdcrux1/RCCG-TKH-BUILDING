'use client';

import { Download } from 'lucide-react';

export default function TaxReceiptButton({ donorName, totalContributed }: { donorName: string, totalContributed: number }) {
  const handleDownload = () => {
    // Generate a simple printable HTML receipt
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const date = new Date().toLocaleDateString();

    const html = `
      <html>
        <head>
          <title>Tax Receipt - ${donorName}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 40px; }
            h1 { color: #D4AF37; margin: 0; }
            .content { margin-bottom: 40px; }
            .footer { text-align: center; font-size: 0.8rem; color: #666; margin-top: 60px; border-top: 1px solid #ccc; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RCCG The King's House</h1>
            <p>Kingdom Builders Project</p>
          </div>
          <div class="content">
            <h2>Official Tax Receipt</h2>
            <p><strong>Date Issued:</strong> ${date}</p>
            <p><strong>Issued To:</strong> ${donorName}</p>
            <p>This document serves as an official receipt acknowledging that ${donorName} has generously contributed a total of <strong>₦${totalContributed.toLocaleString()}</strong> towards the RCCG The King's House Kingdom Builders Project.</p>
            <p>We deeply appreciate your continued support and financial commitment to this building project.</p>
          </div>
          <div class="footer">
            <p>RCCG The King's House is a registered religious organization.</p>
            <p>Please retain this receipt for your tax records.</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <button 
      onClick={handleDownload}
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
  );
}
