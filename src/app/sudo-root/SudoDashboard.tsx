'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { approvePaymentClaim, rejectPaymentClaim, generateMasterReport, reverseContribution, updateSystemVariable, revokeSession, killAllSessions, updateDonorTier, regenerateClaimToken } from './actions';
import AddDonorModal from '@/components/AddDonorModal';
import ConciergeLogger from './ConciergeLogger';
import UnmanagedFundsLogger from './UnmanagedFundsLogger';

type Data = {
  contributions: any[];
  donors: any[];
  sessions: any[];
  actionLogs: any[];
  staff: any[];
  milestones: any[];
  systemVariables: {
    totalTarget: string;
    basementTarget: string;
    groundFloorTarget: string;
  };
  paymentClaims: any[];
  pledgeRequests: any[];
};

export default function SudoDashboard({ data }: { data: Data }) {
  const [activeTab, setActiveTab] = useState('concierge');
  const [contributions, setContributions] = useState(data.contributions);
  const [donors] = useState(data.donors);
  const [sessions, setSessions] = useState(data.sessions);
  const [actionLogs, setActionLogs] = useState(data.actionLogs);
  const [staff, setStaff] = useState(data.staff);
  const [paymentClaims, setPaymentClaims] = useState(data.paymentClaims);
  const [pledgeRequests, setPledgeRequests] = useState(data.pledgeRequests || []);
  const [systemVars, setSystemVars] = useState(data.systemVariables);
  const [editId, setEditId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [newStaffUser, setNewStaffUser] = useState('');
  const [newStaffPass, setNewStaffPass] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('VOLUNTEER');
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [varValue, setVarValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Bulk upload state
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvStatus, setCsvStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/sudo-refresh').then(r => r.json());
      if (res.sessions) setSessions(res.sessions);
      if (res.actionLogs) setActionLogs(res.actionLogs);
      if (res.pledgeRequests) setPledgeRequests(res.pledgeRequests);
    };

    fetchData();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/sudo-logout', { method: 'POST' });
    router.push('/login');
  };

  const handleEditContribution = async (id: string) => {
    const prevContributions = [...contributions];
    const newAmount = parseFloat(editAmount);
    setContributions(contributions.map(c => c.id === id ? { ...c, amount: newAmount } : c));
    setEditId(null);
    
    try {
      const res = await fetch('/api/sudo-edit-contribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, amount: newAmount }),
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (e) {
      setContributions(prevContributions);
      setError('Failed to update. Reverted.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteContribution = async (id: string) => {
    if (!confirm('Delete this contribution?')) return;
    const prevContributions = [...contributions];
    setContributions(contributions.filter(c => c.id !== id));
    
    try {
      const res = await fetch('/api/sudo-delete-contribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
    } catch (e) {
      setContributions(prevContributions);
      setError('Failed to delete. Reverted.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCreateStaff = async () => {
    if (!newStaffUser || !newStaffPass) return;
    const res = await fetch('/api/sudo-create-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newStaffUser, password: newStaffPass, role: newStaffRole }),
    });
    
    if (res.ok) {
      setNewStaffUser('');
      setNewStaffPass('');
      const refresh = await fetch('/api/sudo-refresh').then(r => r.json());
      if (refresh.staff) setStaff(refresh.staff);
    } else {
      setError('Failed to create staff');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRevokeAccess = async (id: string, currentActive: boolean) => {
    const prevStaff = [...staff];
    setStaff(staff.map(s => s.id === id ? { ...s, isActive: !currentActive } : s));
    
    try {
      const res = await fetch('/api/sudo-revoke-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      if (!res.ok) throw new Error('Failed');
    } catch (e) {
      setStaff(prevStaff);
      setError('Failed to update access. Reverted.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateSystemVar = async (key: string) => {
    const res = await updateSystemVariable(key, varValue);
    if (res.success) {
      setSystemVars({ ...systemVars, [key]: varValue });
      setEditingVar(null);
    } else {
      setError('Failed to update system variable');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleGenerateMasterReport = async () => {
    try {
      const res = await generateMasterReport();
      if (res.success && res.csv) {
        const blob = new Blob([res.csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `KingdomBuilders_MasterReport_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (e) {
      setError('Failed to generate master report');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleReverseContribution = async (id: string) => {
    const confirmation = prompt('WARNING: You are about to permanently reverse this contribution. This will deduct the amount from the builder\'s verified balance. To confirm, please type "REVERSE" below:');
    if (confirmation !== 'REVERSE') {
      alert('Reversal cancelled. You must type "REVERSE" exactly.');
      return;
    }
    const prevContributions = [...contributions];
    setContributions(contributions.filter(c => c.id !== id));
    
    try {
      const res = await reverseContribution(id);
      if (!res.success) throw new Error(res.error);
    } catch (e) {
      setContributions(prevContributions);
      setError('Reversal failed: ' + (e as Error).message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Revoke this session? The user will be immediately logged out.')) return;
    try {
      const res = await revokeSession(sessionId);
      if (res.success) {
        setSessions(sessions.filter(s => s.sessionId !== sessionId));
      } else {
        setError('Failed to revoke session');
        setTimeout(() => setError(null), 3000);
      }
    } catch (e) {
      setError('Error revoking session');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleKillAllSessions = async () => {
    if (!confirm('WARNING: Are you sure you want to force-logout all active users? This will instantly terminate all active kiosks.')) return;
    try {
      const res = await killAllSessions();
      if (res.success) {
        setSessions([]);
      } else {
        setError('Failed to terminate sessions');
        setTimeout(() => setError(null), 3000);
      }
    } catch (e) {
      setError('Error terminating sessions');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleExportCSV = async () => {
    const rows = [
      ['ID', 'Donor', 'Phone', 'Amount', 'Date', 'Reference', 'Narrative'],
      ...contributions.map(c => [
        c.id, c.donor?.name || '', c.donor?.phone || '', (Number(c.amount) / 100).toFixed(2), 
        c.date ? new Date(c.date).toISOString().split('T')[0] : '', 
        c.reference || '', c.narrative || ''
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ledger_export.csv';
    a.click();
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#ccc', fontFamily: 'monospace', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
        <span style={{ fontSize: '18px' }}>SUDO ROOT</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {error && <span style={{ color: '#f00', fontSize: '12px' }}>{error}</span>}
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #333', color: '#666', padding: '4px 12px', cursor: 'pointer' }}>logout</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['reconciliation', 'concierge', 'donors', 'unmanaged_funds', 'bulk_donors', 'bulk_contributions', 'watchtower', 'system', 'pledges'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? '#111' : 'transparent',
              border: '1px solid #333',
              color: activeTab === tab ? '#fff' : '#666',
              padding: '8px 16px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontSize: '12px'
            }}
          >
            {tab}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <AddDonorModal />
        </div>
      </div>

      {activeTab === 'reconciliation' && (
        <div style={{ border: '1px solid #222' }}>
          <div style={{ padding: '12px', background: '#111', fontSize: '14px', color: '#888', borderBottom: '1px solid #222' }}>PENDING PAYMENT VERIFICATIONS</div>
          <div style={{ overflowX: 'auto' }}>
            <div className="tableResponsive"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#050505', color: '#666' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>DONOR (ID)</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>AMOUNT</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>DATE</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>BANK</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paymentClaims.filter(c => c.status === 'PENDING').length > 0 ? (
                  paymentClaims.filter(c => c.status === 'PENDING').map(claim => (
                    <tr key={claim.id} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ color: '#fff' }}>{claim.donor?.name}</div>
                        <div style={{ color: '#444', fontSize: '10px' }}>{claim.donor?.donorRefId}</div>
                      </td>
                      <td style={{ padding: '12px', color: '#fff', fontWeight: 'bold' }}>₦{(Number(claim.amount) / 100).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>{new Date(claim.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>{claim.bankName}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={async () => {
                            if (!confirm('Approve this payment? This will update the ledger.')) return;
                            const res = await approvePaymentClaim(claim.id);
                            if (res.success) {
                              setPaymentClaims(paymentClaims.map(c => c.id === claim.id ? { ...c, status: 'APPROVED' } : c));
                            } else {
                              alert(res.error);
                            }
                          }}
                          style={{ background: '#0f02', border: '1px solid #0f0', color: '#0f0', padding: '4px 12px', cursor: 'pointer', marginRight: '8px', fontSize: '10px', minHeight: '44px' }}
                        >
                          APPROVE
                        </button>
                        <button 
                          onClick={async () => {
                            if (!confirm('Reject this payment?')) return;
                            const res = await rejectPaymentClaim(claim.id);
                            if (res.success) {
                              setPaymentClaims(paymentClaims.map(c => c.id === claim.id ? { ...c, status: 'REJECTED' } : c));
                            } else {
                              alert(res.error);
                            }
                          }}
                          style={{ background: '#f002', border: '1px solid #f00', color: '#f00', padding: '4px 12px', cursor: 'pointer', fontSize: '10px', minHeight: '44px' }}
                        >
                          REJECT
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#444' }}>No pending verifications. All clear!</td>
                  </tr>
                )}
              </tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === 'concierge' && (
        <div style={{ border: '1px solid #222', padding: '24px' }}>
          <ConciergeLogger />
        </div>
      )}

      {activeTab === 'donors' && (
        <div style={{ border: '1px solid #222' }}>
          <div style={{ padding: '12px', background: '#111', fontSize: '14px', color: '#888', borderBottom: '1px solid #222' }}>ALL DONORS ({donors.length})</div>
          <div className="tableResponsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#222', zIndex: 10 }}>
                <tr style={{ background: '#050505', color: '#666' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>NAME & PHONE</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>REFERENCE ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>STATUS</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>TIER</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>CLAIM LINK ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor) => {
                  const isClaimed = donor.isClaimed;
                  const hasToken = !!donor.claimToken;
                  const isExpired = donor.claimTokenExpires && new Date(donor.claimTokenExpires) < new Date();
                  
                  return (
                    <tr key={donor.id} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{donor.name}</div>
                        <div style={{ color: '#aaa', fontSize: '10px' }}>{donor.phone}</div>
                      </td>
                      <td style={{ padding: '12px', color: '#0f0', fontWeight: 'bold' }}>{donor.donorRefId || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          color: donor.status === 'ACTIVE' ? '#10b981' : '#f59e0b',
                          background: donor.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {donor.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select 
                          defaultValue={donor.tier}
                          onChange={async (e) => {
                            if (!confirm(`Are you sure you want to change this donor's tier to ${e.target.value}? This will update their monthly and total pledges.`)) {
                              e.target.value = donor.tier;
                              return;
                            }
                            const res = await updateDonorTier(donor.id, e.target.value);
                            if (res.success) {
                              alert('Tier updated successfully!');
                            } else {
                              alert(res.error || 'Failed to update tier');
                            }
                          }}
                          style={{ background: '#000', color: '#fff', border: '1px solid #333', padding: '4px', fontSize: '11px' }}
                        >
                          <option value="Cornerstone Partner">Cornerstone Partner (₦1M)</option>
                          <option value="Pillar Builder">Pillar Builder (₦500k)</option>
                          <option value="Foundation Stone">Foundation Stone (₦200k)</option>
                          <option value="Nehemiah Builder">Nehemiah Builder (₦100k)</option>
                          <option value="Covenant Partner">Covenant Partner (₦50k)</option>
                          <option value="Faithful Hand">Faithful Hand (₦20k)</option>
                          <option value="Open-Heart">Open-Heart (₦10k)</option>
                          <option value="Willing Heart">Willing Heart (₦5k)</option>
                          <option value="Supporter">Supporter (Custom)</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {isClaimed ? (
                          <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Claimed</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {hasToken && !isExpired && (
                              <button
                                onClick={() => {
                                  const domain = typeof window !== 'undefined' ? window.location.origin : '';
                                  const tierMinAmounts: Record<string, string> = {
                                    'Cornerstone Partner': '₦1,000,000',
                                    'Pillar Builder': '₦500,000',
                                    'Foundation Stone': '₦200,000',
                                    'Nehemiah Builder': '₦100,000',
                                    'Covenant Partner': '₦50,000',
                                    'Covenant Partners': '₦50,000',
                                    'Faithful Hand': '₦20,000',
                                    'Open-Heart': '₦10,000',
                                    'Willing Heart': '₦5,000'
                                  };
                                  const donorTier = donor.tier || 'Supporter';
                                  const amountStr = tierMinAmounts[donorTier] || '';
                                  const tierDetails = amountStr ? `under the *${donorTier}* tier (${amountStr} / month)` : donorTier && donorTier !== 'Supporter' ? `as a monthly Kingdom Builder (${donorTier})` : 'as a monthly Kingdom Builder';
                                  
                                  const rawMsg = 
                                    `🕊️ *Grace and Peace to you, Bro/Sis!* 🕊️\n\n` +
                                    `We want to say a massive *THANK YOU* for stepping out in faith to partner with us as a monthly Kingdom Builder ${tierDetails} for the RCCG TKH Building Project.\n\n` +
                                    `Please use the secure invitation link below to activate your account and set up your secure login PIN/password:\n\n` +
                                    `👉 *Activate Account:* ${domain}/claim?token=${donor.claimToken}\n\n` +
                                    `*Please note: This activation link is unique to you and will expire in 90 days.*\n\n` +
                                    `Once activated, you can always log back in at any time here:\n` +
                                    `👉 *Login Portal:* ${domain}/login\n\n` +
                                    `God bless you abundantly! 🙏🏽⛪`;
                                  
                                  let phone = donor.phone.replace(/[^0-9]/g, '');
                                  if (phone.startsWith('0')) {
                                    phone = '234' + phone.substring(1);
                                  }
                                  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(rawMsg)}`;
                                  window.open(waLink, '_blank');
                                }}
                                style={{ background: '#25D366', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}
                              >
                                Send via WA
                              </button>
                            )}
                            {(!hasToken || isExpired) && (
                              <button
                                onClick={async () => {
                                  if (!confirm('Generate a new secure claim token for this user?')) return;
                                  const res = await regenerateClaimToken(donor.id);
                                  if (res.success) {
                                    alert('New claim token generated. You can now send it to them via WhatsApp.');
                                    window.location.reload(); // Refresh to update the local state with new token
                                  } else {
                                    alert(res.error || 'Failed to regenerate link');
                                  }
                                }}
                                style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
                              >
                                Regenerate Link
                              </button>
                            )}
                          </div>
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

      {activeTab === 'unmanaged_funds' && (
        <div style={{ padding: '24px' }}>
          <UnmanagedFundsLogger />
        </div>
      )}

{activeTab === 'bulk' && (
  <div style={{ border: '1px solid #222' }}>
    <div style={{ padding: '12px', background: '#111', fontSize: '14px', color: '#888', borderBottom: '1px solid #222' }}>
      BANK STATEMENT CSV UPLOAD (FRAUD & DUPLICATE PROTECTED)
    </div>
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '12px' }}>
          Upload a bank statement in CSV format. The parser expects columns that can map to Date, Narrative/Description, and Amount.
        </p>
        <input 
          type="file" 
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                const rows = results.data.map((row: any) => {
                  // Attempt to find keys dynamically
                  const keys = Object.keys(row);
                  const dateKey = keys.find(k => k.toLowerCase().includes('date'));
                  const amountKey = keys.find(k => k.toLowerCase().includes('amount') || k.toLowerCase().includes('credit') || k.toLowerCase().includes('value'));
                  const narrativeKey = keys.find(k => k.toLowerCase().includes('narrative') || k.toLowerCase().includes('desc') || k.toLowerCase().includes('details') || k.toLowerCase().includes('remarks'));
                  
                  const narrative = narrativeKey ? row[narrativeKey] : '';
                  
                  // Auto-match donor
                  let matchedDonorId = '';
                  let matchedDonorName = '';
                  for (const donor of donors) {
                    const searchStr = (narrative || '').toLowerCase();
                    if ((donor.name && searchStr.includes(donor.name.toLowerCase())) || 
                        (donor.donorRefId && searchStr.includes(donor.donorRefId.toLowerCase()))) {
                      matchedDonorId = donor.id;
                      matchedDonorName = `${donor.name} (${donor.donorRefId})`;
                      break;
                    }
                  }

                  // Parse amount, strip commas/currency symbols
                  let rawAmount = amountKey ? String(row[amountKey]) : '';
                  rawAmount = rawAmount.replace(/[^0-9.]/g, '');
                  
                  return {
                    originalDate: dateKey ? row[dateKey] : '',
                    originalAmount: rawAmount,
                    originalNarrative: narrative,
                    matchedDonorId,
                    matchedDonorName,
                    include: true
                  };
                });
                setCsvData(rows);
              }
            });
          }}
          style={{ padding: '12px', background: '#111', border: '1px dashed #444', width: '100%', color: '#fff', cursor: 'pointer' }}
        />
      </div>

      {csvData.length > 0 && (
        <>
          <div className="tableResponsive" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #333', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#111', zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '8px', textAlign: 'left' }}>INC</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>DATE</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>NARRATIVE</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>AMOUNT</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>MATCHED DONOR (MANUAL SELECT)</th>
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #222', background: row.matchedDonorId ? 'rgba(0, 255, 0, 0.05)' : 'transparent' }}>
                    <td style={{ padding: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={row.include} 
                        onChange={(e) => {
                          const newData = [...csvData];
                          newData[idx].include = e.target.checked;
                          setCsvData(newData);
                        }} 
                      />
                    </td>
                    <td style={{ padding: '8px' }}>{row.originalDate}</td>
                    <td style={{ padding: '8px' }}>{row.originalNarrative}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>₦{Number(row.originalAmount).toLocaleString()}</td>
                    <td style={{ padding: '8px' }}>
                      <select 
                        value={row.matchedDonorId}
                        onChange={(e) => {
                          const newData = [...csvData];
                          newData[idx].matchedDonorId = e.target.value;
                          setCsvData(newData);
                        }}
                        style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #333', padding: '4px' }}
                      >
                        <option value="">-- Select Donor --</option>
                        {donors.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.donorRefId})</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: csvStatus.includes('Error') ? '#f00' : '#0f0' }}>{csvStatus}</span>
            <button 
              disabled={isProcessing}
              onClick={async () => {
                const toProcess = csvData.filter(r => r.include && r.matchedDonorId && r.originalAmount && r.originalDate);
                if (toProcess.length === 0) {
                  setCsvStatus('Error: No valid rows selected with matched donors.');
                  return;
                }
                
                if (!confirm(`Are you sure you want to process ${toProcess.length} transactions to the live ledger?`)) return;
                
                setIsProcessing(true);
                setCsvStatus('Processing...');
                
                try {
                  const payload = {
                    transactions: toProcess.map(r => ({
                      date: new Date(r.originalDate).toISOString(),
                      amount: Number(r.originalAmount),
                      narrative: r.originalNarrative,
                      donorId: r.matchedDonorId
                    }))
                  };
                  
                  const res = await fetch('/api/sudo-bulk-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  
                  const result = await res.json();
                  if (res.ok) {
                    setCsvStatus(`Success! Logged: ${result.successCount} | Duplicates Blocked: ${result.duplicateCount} | Errors: ${result.errorCount}`);
                  } else {
                    setCsvStatus(`Error: ${result.error}`);
                  }
                } catch (e) {
                  setCsvStatus('Network Error');
                }
                setIsProcessing(false);
              }}
              style={{ background: isProcessing ? '#444' : '#10b981', color: '#000', fontWeight: 'bold', padding: '12px 24px', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer' }}
            >
              {isProcessing ? 'PROCESSING...' : `COMMIT TO LEDGER (${csvData.filter(r => r.include && r.matchedDonorId).length} valid)`}
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}

{activeTab === 'bulk_donors' && (
  <div style={{ maxWidth: '1000px' }}>
    <div style={{ marginBottom: '12px', fontSize: '14px', color: '#888' }}>BULK ONBOARD DONORS (CSV)</div>
    <div style={{ background: '#111', padding: '16px', border: '1px solid #333', marginBottom: '20px' }}>
      <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '16px' }}>
        Upload a CSV file containing at minimum `Name` and `Phone` columns. The system will automatically generate Donor IDs and secure single-use claim links for the donors to set their own passwords.
      </p>
      <input 
        type="file" 
        accept=".csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
              const rows = results.data.map((row: any) => {
                const keys = Object.keys(row);
                const nameKey = keys.find(k => k.toLowerCase().includes('name'));
                const phoneKey = keys.find(k => k.toLowerCase().includes('phone') || k.toLowerCase().includes('number') || k.toLowerCase().includes('contact'));
                
                return {
                  name: nameKey ? row[nameKey] : '',
                  phone: phoneKey ? row[phoneKey] : ''
                };
              }).filter((r: any) => r.name && r.phone);
              
              if (rows.length === 0) {
                alert('No valid rows found. Please ensure the CSV has Name and Phone columns.');
                return;
              }

              if (!confirm(`Found ${rows.length} valid donors. Create accounts now?`)) return;

              setCsvStatus('Uploading donors...');
              setIsProcessing(true);

              try {
                const res = await fetch('/api/sudo-bulk-upload-donors', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ donors: rows })
                });
                
                const result = await res.json();
                if (res.ok) {
                  setCsvStatus(`Success! Created: ${result.successCount} | Duplicates Skipped: ${result.duplicateCount} | Errors: ${result.errorCount}`);
                  setCsvData(result.results || []); // Store the success results (with PINs) in csvData to show table
                } else {
                  setCsvStatus(`Error: ${result.error}`);
                }
              } catch (err) {
                setCsvStatus('Network Error during upload.');
              }
              setIsProcessing(false);
            }
          });
        }}
        style={{ padding: '12px', background: '#000', border: '1px dashed #444', width: '100%', color: '#fff', cursor: 'pointer' }}
      />
    </div>

    {csvData.length > 0 && activeTab === 'bulk_donors' && (
      <div style={{ background: '#111', padding: '16px', border: '1px solid #0f0' }}>
        <h3 style={{ color: '#0f0', marginBottom: '16px' }}>Successfully Created ({csvData.length})</h3>
        <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '16px' }}>
          <strong>ACTION REQUIRED:</strong> Please click the WhatsApp buttons below to send the highly secure one-time claim links to the donors so they can set up their own passwords.
        </p>
        
        <button 
          onClick={() => {
            const domain = window.location.origin;
            const csvRows = ['Name,Phone,DonorID,ClaimLink'];
            csvData.forEach(d => csvRows.push(`"${d.name}","${d.phone}","${d.donorRefId}","${domain}/claim?token=${d.claimToken}"`));
            const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `BulkDonors_ClaimLinks_${new Date().getTime()}.csv`;
            a.click();
          }}
          style={{ marginBottom: '16px', background: '#333', color: '#fff', border: '1px solid #555', padding: '8px 16px', cursor: 'pointer' }}
        >
          Download Claim Links CSV Backup
        </button>

        <div className="tableResponsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#222' }}>
              <tr>
                <th style={{ padding: '8px', textAlign: 'left' }}>NAME</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>PHONE</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>DONOR ID</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {csvData.map((donor, idx) => {
                const domain = typeof window !== 'undefined' ? window.location.origin : '';
                const tierMinAmounts: Record<string, string> = {
                  'Cornerstone Partner': '₦1,000,000',
                  'Pillar Builder': '₦500,000',
                  'Foundation Stone': '₦200,000',
                  'Nehemiah Builder': '₦100,000',
                  'Covenant Partner': '₦50,000',
                  'Covenant Partners': '₦50,000',
                  'Faithful Hand': '₦20,000',
                  'Open-Heart': '₦10,000',
                  'Willing Heart': '₦5,000'
                };
                const donorTier = donor.tier || 'Supporter';
                const amountStr = tierMinAmounts[donorTier] || '';
                const tierDetails = amountStr ? `under the *${donorTier}* tier (${amountStr} / month)` : donorTier && donorTier !== 'Supporter' && donorTier !== 'SUPPORTER' ? `as a monthly Kingdom Builder (${donorTier})` : 'as a monthly Kingdom Builder';
                
                const rawMsg = 
                  `🕊️ *Grace and Peace to you, Bro/Sis!* 🕊️\n\n` +
                  `We want to say a massive *THANK YOU* for stepping out in faith to partner with us as a monthly Kingdom Builder ${tierDetails} for the RCCG TKH Building Project.\n\n` +
                  `Your builder account has been successfully created. Please use the secure invitation link below to activate your account, set up your secure login PIN/password, and access your dashboard where you can log contributions and track progress:\n\n` +
                  `👉 *Activate Account:* ${domain}/claim?token=${donor.claimToken}\n\n` +
                  `*Please note: This activation link is unique to you and will expire in 90 days.*\n\n` +
                  `• *Donor Reference ID:* ${donor.donorRefId || 'N/A'}\n\n` +
                  `Once activated, you can always log back in at any time here:\n` +
                  `👉 *Login Portal:* ${domain}/login\n\n` +
                  `"Let us rise up and build." (Nehemiah 2:18). Thank you for your incredible sacrifice. God bless you abundantly! 🙏🏽⛪`;
                
                let phone = donor.phone.replace(/[^0-9]/g, '');
                if (phone.startsWith('0')) {
                  phone = '234' + phone.substring(1);
                }
                const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(rawMsg)}`;
                
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '8px' }}>{donor.name}</td>
                    <td style={{ padding: '8px' }}>{donor.phone}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold', color: 'var(--tier-primary)' }}>{donor.donorRefId}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <a 
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-block', background: '#25D366', color: '#fff', padding: '6px 12px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                      >
                        Send WhatsApp
                      </a>
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
)}

{activeTab === 'pledges' && (
  <div style={{ border: '1px solid #222' }}>
    <div style={{ padding: '12px', background: '#111', fontSize: '14px', color: '#888', borderBottom: '1px solid #222' }}>PENDING WEBSITE PLEDGES</div>
    {pledgeRequests.length === 0 ? (
      <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>No pending pledges from the website.</div>
    ) : (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#050505', color: '#666' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>NAME</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>PHONE</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>TIER</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>DATE</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {pledgeRequests.map((pledge: any) => (
              <tr key={pledge.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '12px' }}>{pledge.name}</td>
                <td style={{ padding: '12px' }}>{pledge.phone}</td>
                <td style={{ padding: '12px' }}>{pledge.tier}</td>
                <td style={{ padding: '12px', color: '#888' }}>{new Date(pledge.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button
                    onClick={async () => {
                      if (!confirm('Approve this pledge and create their account?')) return;
                      try {
                        const res = await fetch('/api/sudo-approve-pledge', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ pledgeId: pledge.id, action: 'APPROVE' })
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setPledgeRequests(pledgeRequests.filter((p: any) => p.id !== pledge.id));
                          // Show credentials temporarily
                          const domain = window.location.origin;
                          const tierMinAmounts: Record<string, string> = {
                            'Cornerstone Partner': '₦1,000,000',
                            'Pillar Builder': '₦500,000',
                            'Foundation Stone': '₦200,000',
                            'Nehemiah Builder': '₦100,000',
                            'Covenant Partner': '₦50,000',
                            'Covenant Partners': '₦50,000',
                            'Faithful Hand': '₦20,000',
                            'Open-Heart': '₦10,000',
                            'Willing Heart': '₦5,000'
                          };
                          const pledgeTier = pledge.tier || 'Supporter';
                          const amountStr = tierMinAmounts[pledgeTier] || '';
                          const tierDetails = amountStr ? `under the *${pledgeTier}* tier (${amountStr} / month)` : pledgeTier && pledgeTier !== 'Supporter' && pledgeTier !== 'SUPPORTER' ? `as a monthly Kingdom Builder (${pledgeTier})` : 'as a monthly Kingdom Builder';
                          
                          const rawMsg = 
                            `🕊️ *Grace and Peace to you, Bro/Sis!* 🕊️\n\n` +
                            `We want to say a massive *THANK YOU* for stepping out in faith to partner with us as a monthly Kingdom Builder ${tierDetails} for the RCCG TKH Building Project.\n\n` +
                            `Your builder account has been successfully created. Please use the secure invitation link below to activate your account, set up your secure login PIN/password, and access your dashboard where you can log contributions and track progress:\n\n` +
                            `👉 *Activate Account:* ${domain}/claim?token=${data.donorInfo.claimToken}\n\n` +
                            `*Please note: This activation link is unique to you and will expire in 90 days.*\n\n` +
                            `• *Donor Reference ID:* ${data.donorInfo.donorRefId || 'N/A'}\n\n` +
                            `Once activated, you can always log back in at any time here:\n` +
                            `👉 *Login Portal:* ${domain}/login\n\n` +
                            `"Let us rise up and build." (Nehemiah 2:18). Thank you for your incredible sacrifice. God bless you abundantly! 🙏🏽⛪`;
                          
                          let cleanPhone = pledge.phone.replace(/[^0-9]/g, '');
                          if (cleanPhone.startsWith('0')) {
                            cleanPhone = '234' + cleanPhone.substring(1);
                          }
                          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMsg)}`;
                          
                          // We open it in a new tab immediately
                          window.open(waUrl, '_blank');
                          alert(`Account created!\nID: ${data.donorInfo.donorRefId}\n\nA WhatsApp tab should have opened automatically with their secure Claim Link.`);
                        } else {
                          alert(data.error);
                        }
                      } catch (e) {
                        alert('Network error');
                      }
                    }}
                    style={{ background: '#10b981', color: '#000', border: 'none', padding: '4px 12px', cursor: 'pointer', marginRight: '8px', fontWeight: 'bold' }}
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Reject this pledge? This cannot be undone.')) return;
                      try {
                        const res = await fetch('/api/sudo-approve-pledge', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ pledgeId: pledge.id, action: 'REJECT' })
                        });
                        if (res.ok) {
                          setPledgeRequests(pledgeRequests.filter((p: any) => p.id !== pledge.id));
                        }
                      } catch (e) {
                        alert('Network error');
                      }
                    }}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 12px', cursor: 'pointer' }}
                  >
                    REJECT
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

{activeTab === 'watchtower' && (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
    {/* LEFT PANE: ACTIVE SESSIONS */}
    <div style={{ border: '1px solid #222' }}>
      <div style={{ padding: '12px', background: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' }}>
        <span style={{ fontSize: '14px', color: '#888' }}>LIVE ACTIVE SESSIONS ({sessions.length})</span>
        {sessions.length > 0 && (
          <button 
            onClick={handleKillAllSessions}
            style={{ background: '#f003', border: '1px solid #f00', color: '#f00', padding: '4px 12px', cursor: 'pointer', fontSize: '10px' }}
          >
            KILL ALL SESSIONS
          </button>
        )}
      </div>
      <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '12px' }}>
        {sessions.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No active sessions</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.map(session => (
              <div key={session.sessionId} style={{ background: '#0a0a0a', border: '1px solid #333', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#0f0', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
                    ROLE: {session.userRole}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '11px' }}>
                    User ID: {session.userId || 'N/A'}
                  </div>
                  <div style={{ color: '#666', fontSize: '10px', marginTop: '4px' }}>
                    Logged in: {formatTime(session.loginTimestamp)}
                  </div>
                </div>
                <button 
                  onClick={() => handleRevokeSession(session.sessionId)}
                  style={{ background: 'transparent', border: '1px solid #f00', color: '#f00', padding: '4px 8px', cursor: 'pointer', fontSize: '10px', minHeight: '44px' }}
                >
                  REVOKE
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* RIGHT PANE: AUDIT TRAIL / ACTION LOGS */}
    <div style={{ border: '1px solid #222' }}>
      <div style={{ padding: '12px', background: '#111', fontSize: '14px', color: '#888', borderBottom: '1px solid #222' }}>
        SYSTEM AUDIT TRAIL (LAST 100)
      </div>
      <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '12px' }}>
        {actionLogs.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No logs recorded</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {actionLogs.map(log => (
              <div key={log.logId} style={{ background: '#0a0a0a', border: '1px solid #333', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#0f0', fontWeight: 'bold', fontSize: '12px' }}>{log.actionType}</span>
                  <span style={{ color: '#666', fontSize: '10px' }}>{formatTime(log.timestamp)}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
                  <span>User: {log.userRole}</span>
                  {log.targetRecordId && <span>Target: {log.targetRecordId.substring(0,8)}...</span>}
                </div>
                {log.details && (
                  <pre style={{ margin: 0, padding: '8px', background: '#050505', border: '1px solid #222', fontSize: '10px', color: '#888', overflowX: 'auto' }}>
                    {log.details}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}

      {activeTab === 'system' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#888' }}>SYSTEM VARIABLES</div>
            <div style={{ border: '1px solid #222', padding: '12px' }}>
              {Object.entries(systemVars).map(([key, val]) => (
                <div key={key} style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{key}</div>
                  {editingVar === key ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        value={varValue} 
                        onChange={e => setVarValue(e.target.value)}
                        style={{ flex: 1, padding: '4px', background: '#111', border: '1px solid #333', color: '#fff', fontFamily: 'monospace' }}
                      />
                      <button onClick={() => handleUpdateSystemVar(key)} style={{ padding: '4px 8px', background: '#111', border: '1px solid #333', color: '#0f0', cursor: 'pointer', minHeight: '44px' }}>ok</button>
                      <button onClick={() => setEditingVar(null)} style={{ padding: '4px 8px', background: '#111', border: '1px solid #333', color: '#f00', cursor: 'pointer', minHeight: '44px' }}>x</button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => { setEditingVar(key); setVarValue(val as string); }}
                      style={{ padding: '6px', background: '#111', border: '1px solid #222', cursor: 'pointer' }}
                    >
                      {val}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#888' }}>MASTER REPORT</div>
            <button 
              onClick={handleGenerateMasterReport}
              style={{ width: '100%', padding: '16px', background: '#d97706', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '24px' }}
            >
              GENERATE MASTER FINANCIAL CSV
            </button>

            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#888' }}>LEDGER EXPORT</div>
            <button 
              onClick={handleExportCSV}
              style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' }}
            >
              export current ledger csv
            </button>
          </div>
        </div>
      )}
    </div>
  );
}