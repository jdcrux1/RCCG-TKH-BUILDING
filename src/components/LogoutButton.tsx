'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/app/admin/actions';

export default function LogoutButton() {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <button 
      onClick={handleLogout}
      style={{
        background: 'transparent',
        color: 'var(--danger)',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      <LogOut size={16} /> <span className="hide-mobile">Logout</span>
    </button>
  );
}
