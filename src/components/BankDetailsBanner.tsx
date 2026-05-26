'use client';

import { useState } from 'react';
import { Landmark, Copy, Check, MessageSquare, Info } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function BankDetailsBanner({ donorName, donorRefId }: { donorName: string; donorRefId: string }) {
  const { showToast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankName = "Premium Trust Bank";
  const accountNumber = "0040239581";
  const accountName = "RCCG The King's House Building Project";
  const uniqueId = donorRefId || "PENDING";

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`${fieldName} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getWhatsAppLink = () => {
    const text = `Hello RCCG TKH Committee, I have just completed my manual bank transfer contribution. Details:\n\n- *Name*: ${donorName}\n- *Donor ID*: ${uniqueId}\n- *Amount*: ₦\n- *Bank Transferred From*: \n- *Date*: ${new Date().toLocaleDateString()}\n\nI have uploaded the claim in the portal. Please verify. Thank you!`;
    return `https://wa.me/2348052039445?text=${encodeURIComponent(text)}`;
  };

  return (
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Landmark size={28} />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>Official Bank Transfer Details</h2>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>Use the details below for your manual contributions.</p>
          </div>
        </div>

        <a 
          href={getWhatsAppLink()} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            background: 'rgba(0,0,0,0.3)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.2s',
            minHeight: 'auto'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
        >
          <MessageSquare size={16} /> Instant WhatsApp Confirm
        </a>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1.2rem',
        background: 'rgba(255,255,255,0.1)',
        padding: '1.2rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)', padding: '10px 14px', borderRadius: '6px' }}>
          <div>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginBottom: '2px' }}>Bank Name</p>
            <p style={{ fontWeight: 'bold', fontSize: '1rem', margin: 0 }}>{bankName}</p>
          </div>
          <button 
            onClick={() => handleCopy(bankName, "Bank Name")}
            style={{ background: 'transparent', color: 'inherit', padding: '6px', minWidth: 'auto', minHeight: 'auto', cursor: 'pointer' }}
            title="Copy Bank Name"
          >
            {copiedField === "Bank Name" ? <Check size={16} color="#10b981" /> : <Copy size={16} style={{ opacity: 0.7 }} />}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)', padding: '10px 14px', borderRadius: '6px' }}>
          <div>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginBottom: '2px' }}>Account Number</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.05rem', fontFamily: 'monospace', margin: 0 }}>{accountNumber}</p>
          </div>
          <button 
            onClick={() => handleCopy(accountNumber, "Account Number")}
            style={{ background: 'transparent', color: 'inherit', padding: '6px', minWidth: 'auto', minHeight: 'auto', cursor: 'pointer' }}
            title="Copy Account Number"
          >
            {copiedField === "Account Number" ? <Check size={16} color="#10b981" /> : <Copy size={16} style={{ opacity: 0.7 }} />}
          </button>
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)', padding: '10px 14px', borderRadius: '6px' }}>
          <div>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginBottom: '2px' }}>Account Name</p>
            <p style={{ fontWeight: 'bold', fontSize: '1rem', margin: 0 }}>{accountName}</p>
          </div>
          <button 
            onClick={() => handleCopy(accountName, "Account Name")}
            style={{ background: 'transparent', color: 'inherit', padding: '6px', minWidth: 'auto', minHeight: 'auto', cursor: 'pointer' }}
            title="Copy Account Name"
          >
            {copiedField === "Account Name" ? <Check size={16} color="#10b981" /> : <Copy size={16} style={{ opacity: 0.7 }} />}
          </button>
        </div>
      </div>

      <div style={{ 
        background: 'rgba(0,0,0,0.4)', 
        padding: '1.2rem', 
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
          width: '36px', height: '36px', borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
        }}>
          <Info size={20} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: 0, color: 'white', flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px', opacity: 0.8 }}>CRITICAL INSTRUCTION:</strong>
            Include your Unique ID <span style={{ textDecoration: 'underline', fontWeight: '900' }}>MUST</span> be in the <strong>Narration/Description</strong>: <strong style={{ fontSize: '1.15rem', color: '#fbbf24', textShadow: '0 0 10px rgba(251,191,36,0.3)', fontFamily: 'monospace' }}>{uniqueId}</strong>
          </p>
          <button 
            onClick={() => handleCopy(uniqueId, "Donor ID")}
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              padding: '6px 12px', 
              borderRadius: '4px', 
              fontSize: '0.75rem', 
              fontWeight: 'bold',
              minWidth: 'auto', 
              minHeight: 'auto',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: 'none'
            }}
          >
            {copiedField === "Donor ID" ? <Check size={14} color="#10b981" /> : <Copy size={14} />} Copy ID
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-border {
          0% { border-color: rgba(255,255,255,1); }
          50% { border-color: rgba(255,255,255,0.2); }
          100% { border-color: rgba(255,255,255,1); }
        }
      `}} />
    </section>
  );
}
