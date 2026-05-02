export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Clock, User, Info, Key } from 'lucide-react';
import { formatTimestampWAT } from '@/lib/sanitize';

export default async function AuditLogs() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div>
      <header style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>System Audit Logs</h1>
        <p style={{ opacity: 0.6 }}>Track all administrative actions and donor registrations</p>
      </header>

      <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>Timestamp</th>
              <th style={{ padding: '1rem' }}>Admin / User</th>
              <th style={{ padding: '1rem' }}>Action</th>
              <th style={{ padding: '1rem' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const details = typeof log.details === 'string' ? JSON.parse(log.details) : (log.details as any) || {};
              return (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', opacity: 0.7 }}>
                    {formatTimestampWAT(log.createdAt)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} opacity={0.5} />
                      <div>
                        <p style={{ fontSize: '0.9rem' }}>{log.userName}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: log.action.includes('FAILED') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                      color: log.action.includes('FAILED') ? 'var(--danger)' : 'inherit',
                      padding: '4px 8px', 
                      borderRadius: '4px' 
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {log.action === 'CREATE_DONOR' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: '600' }}>
                          <Key size={14} /> 
                          PIN: {details.pin || 'N/A'}
                        </div>
                      )}
                      <div style={{ opacity: 0.6 }}>
                         {details.name && `Name: ${details.name} • `}
                         {details.phone && `Phone: ${details.phone} • `}
                         {details.amount && `Amount: ₦${details.amount.toLocaleString()} • `}
                         {details.reason && `Reason: ${details.reason}`}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                  No activity logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
