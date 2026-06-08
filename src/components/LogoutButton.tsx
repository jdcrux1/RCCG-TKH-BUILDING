'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/app/admin/actions';
import styles from './LogoutButton.module.css';

export default function LogoutButton() {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <button 
      onClick={handleLogout}
      className={styles.logoutBtn}
    >
      <LogOut size={16} /> <span className="hide-mobile">Logout</span>
    </button>
  );
}
