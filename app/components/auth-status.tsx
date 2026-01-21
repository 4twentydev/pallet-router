'use client';

import { logout } from '../actions/auth';
import { AdminPanel } from './admin-panel';

interface AuthStatusProps {
  isLoggedIn: boolean;
  name?: string;
  role?: 'admin' | 'user';
}

export function AuthStatus({ isLoggedIn, name, role }: AuthStatusProps) {
  if (!isLoggedIn) {
    return null;
  }

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <span className="text-muted">Signed in as </span>
        <span className="font-medium text-strong">{name}</span>
        {role === 'admin' && (
          <span className="ml-2 rounded-full bg-accent-secondary/10 px-2 py-0.5 text-xs font-medium text-accent-secondary">
            Admin
          </span>
        )}
      </div>

      {role === 'admin' && <AdminPanel />}

      <button
        onClick={handleLogout}
        className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-all hover:border-strong hover:text-strong"
      >
        Sign Out
      </button>
    </div>
  );
}
