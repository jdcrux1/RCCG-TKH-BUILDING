'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { approvePaymentClaim, rejectPaymentClaim, generateMasterReport, reverseContribution, updateSystemVariable } from './actions';

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
};

export default function SudoDashboard({ data }: { data: Data }) {
  const [activeTab, setActiveTab] = useState('access');
  const [contributions, setContributions] = useState(data.contributions);
  const [donors] = useState(data.donors);
  const [sessions, setSessions] = useState(data.sessions);
  const [actionLogs, setActionLogs] = useState(data.actionLogs);
  const [staff, setStaff] = useState(data.staff);
  const [paymentClaims, setPaymentClaims] = useState(data.paymentClaims);
  const [systemVars, setSystemVars] = useState(data.systemVariables);
  const [editId, setEditId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [newStaffUser, setNewStaffUser] = useState('');
  const [newStaffPass, setNewStaffPass] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('VOLUNTEER');
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [varValue, setVarValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/sudo-refresh').then(r => r.json());
      if (res.sessions) setSessions(res.sessions);
      if (res.actionLogs) setActionLogs(res.actionLogs);
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
    if (!confirm('REVERSE this contribution? This will deduct the amount from the donor balance.')) return;
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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['access', 'reconciliation', 'watchtower', 'team', 'system'].map(tab => (
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
      </div>

      {activeTab === 'reconciliation' && (
        <div style={{ border: '1px solid #222' }}>
          <div style={{ padding: '12px', background: '#111', fontSize: '14px', color: '#888', borderBottom: '1px solid #222' }}>PENDING PAYMENT VERIFICATIONS</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
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
                          style={{ background: '#0f02', border: '1px solid #0f0', color: '#0f0', padding: '4px 12px', cursor: 'pointer', marginRight: '8px', fontSize: '10px' }}
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
                          style={{ background: '#f002', border: '1px solid #f00', color: '#f00', padding: '4px 12px', cursor: 'pointer', fontSize: '10px' }}
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
            </table>
          </div>
        </div>
      )}

      {activeTab === 'access' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#888' }}>DIRECT PORTALS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/admin/onboard" target="_blank" style={{ color: '#fff', textDecoration: 'none', border: '1px solid #222', padding: '8px', display: 'block' }}>[+] /onboard</a>
              <a href="/admin/donors" target="_blank" style={{ color: '#fff', textDecoration: 'none', border: '1px solid #222', padding: '8px', display: 'block' }}>[+] /donors-whatsapp</a>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#888' }}>LEDGER MANAGEMENT</div>
            <div style={{ overflowX: 'auto', border: '1px solid #222' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#111' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>DONOR</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>AMOUNT</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>DATE</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>ACT</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.slice(0, 20).map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '6px' }}>{c.donor?.name || 'N/A'}</td>
                      <td style={{ padding: '6px' }}>
                        {editId === c.id ? (
                          <input value={editAmount} onChange={e => setEditAmount(e.target.value)} style={{ background: '#111', border: '1px solid #333', color: '#fff', width: '80px', padding: '2px' }} />
                        ) : (
                          c.amount
                        )}
                      </td>
                      <td style={{ padding: '6px' }}>{c.date ? new Date(c.date).toLocaleDateString() : '-'}</td>
                      <td style={{ padding: '6px' }}>
                        {editId === c.id ? (
                          <>
                            <button onClick={() => handleEditContribution(c.id)} style={{ background: 'transparent', border: '1px solid #333', color: '#0f0', cursor: 'pointer', marginRight: '4px', padding: '2px 6px' }}>ok</button>
                            <button onClick={() => setEditId(null)} style={{ background: 'transparent', border: '1px solid #333', color: '#f00', cursor: 'pointer', padding: '2px 6px' }}>x</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditId(c.id); setEditAmount((Number(c.amount)/100).toString()); }} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', marginRight: '8px' }}>edit</button>
                            <button onClick={() => handleReverseContribution(c.id)} style={{ background: 'transparent', border: '1px solid #f002', color: '#f44', cursor: 'pointer', padding: '2px 6px', fontSize: '10px' }}>REVERSE</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'watchtower' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#888' }}>SESSION TRACKER</div>
            <div style={{ border: '1px solid #222', padding: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#111' }}>
                    <th style={{ padding: '6px', textAlign: 'left' }}>ROLE</th>
                    <th style={{ padding: '6px', textAlign: 'left' }}>LOGIN</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.sessionId} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '6px' }}>{s.userRole}</td>
                      <td style={{ padding: '6px' }}>{formatTime(s.loginTimestamp)}</td>
                    </tr>
                  ))}
                  {sessions.length === 0 && <tr><td colSpan={2} style={{ padding: '12px', textAlign: 'center', color: '#444' }}>no active sessions</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#888' }}>ACTION FEED</div>
            <div style={{ border: '1px solid #222', padding: '12px', height: '400px', overflowY: 'auto', fontSize: '11px', background: '#050505', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {actionLogs.map(log => (
                <div key={log.logId} style={{ padding: '8px', borderLeft: '2px solid #333', background: '#0a0a0a', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <span style={{ color: '#555' }}>[{formatTime(log.timestamp)}]</span> <strong style={{ color: '#ddd' }}>{log.userRole}</strong> {log.actionType.replace(/_/g, ' ')}
                    {log.targetRecordId && <span style={{ color: '#444' }}> #{log.targetRecordId.slice(0,8)}</span>}
                  </span>
                  <span style={{ fontSize: '9px', color: '#444' }}>{log.details || ''}</span>
                </div>
              ))}
              {actionLogs.length === 0 && <div style={{ color: '#444', textAlign: 'center', padding: '2rem' }}>no actions logged</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#888' }}>PROVISION STAFF</div>
            <div style={{ border: '1px solid #222', padding: '12px' }}>
              <input 
                value={newStaffUser} 
                onChange={e => setNewStaffUser(e.target.value)} 
                placeholder="username" 
                style={{ display: 'block', width: '100%', marginBottom: '8px', padding: '6px', background: '#111', border: '1px solid #222', color: '#fff', fontFamily: 'monospace' }} 
              />
              <input 
                type="password"
                value={newStaffPass} 
                onChange={e => setNewStaffPass(e.target.value)} 
                placeholder="password" 
                style={{ display: 'block', width: '100%', marginBottom: '8px', padding: '6px', background: '#111', border: '1px solid #222', color: '#fff', fontFamily: 'monospace' }} 
              />
              <select 
                value={newStaffRole} 
                onChange={e => setNewStaffRole(e.target.value)}
                style={{ display: 'block', width: '100%', marginBottom: '8px', padding: '6px', background: '#111', border: '1px solid #222', color: '#fff', fontFamily: 'monospace' }}
              >
                <option value="VOLUNTEER">Volunteer</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button 
                onClick={handleCreateStaff}
                style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                create
              </button>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#888' }}>ACTIVE STAFF</div>
            <div style={{ border: '1px solid #222' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#111' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>USERNAME</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>ROLE</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>STATUS</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '6px' }}>{s.username}</td>
                      <td style={{ padding: '6px' }}>{s.role}</td>
                      <td style={{ padding: '6px', color: s.isActive ? '#0f0' : '#f00' }}>{s.isActive ? 'ACTIVE' : 'REVOKED'}</td>
                      <td style={{ padding: '6px' }}>
                        <button 
                          onClick={() => handleRevokeAccess(s.id, s.isActive)}
                          style={{ background: 'transparent', border: '1px solid #333', color: s.isActive ? '#f00' : '#0f0', cursor: 'pointer', padding: '2px 8px' }}
                        >
                          {s.isActive ? 'revoke' : 'restore'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && <tr><td colSpan={4} style={{ padding: '12px', textAlign: 'center', color: '#444' }}>no staff accounts</td></tr>}
                </tbody>
              </table>
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
                      <button onClick={() => handleUpdateSystemVar(key)} style={{ padding: '4px 8px', background: '#111', border: '1px solid #333', color: '#0f0', cursor: 'pointer' }}>ok</button>
                      <button onClick={() => setEditingVar(null)} style={{ padding: '4px 8px', background: '#111', border: '1px solid #333', color: '#f00', cursor: 'pointer' }}>x</button>
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