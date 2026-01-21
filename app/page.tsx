import { getPalletData } from './actions/pallets';
import { getSessionData } from './actions/auth';
import PalletTracker from './components/pallet-tracker';
import ThemeToggle from './components/theme-toggle';
import { AuthStatus } from './components/auth-status';
import { LoginForm } from './components/login-form';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSessionData();
  let initialData = null;

  // Only load data if user is authenticated
  if (session.isLoggedIn) {
    try {
      initialData = await getPalletData();
      console.log('[Home] Loaded pallets:', initialData.pallets.length);
    } catch (error) {
      console.error('[Home] Failed to load initial data:', error);
      // Don't throw - let the user see the error message in the UI
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-base">
      {/* Header */}
      <header className="border-b border-subtle bg-[color:var(--surface)]">
        <div className="app-shell app-shell-header flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent-secondary">
                Elward Systems
              </p>
              <h1 className="text-lg font-semibold text-strong">
                Pallet Tracker
              </h1>
            </div>
            <ThemeToggle />
          </div>
          <AuthStatus
            isLoggedIn={session.isLoggedIn}
            name={session.name}
            role={session.role}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="app-shell app-shell-main">
          {session.isLoggedIn ? (
            initialData ? (
              <PalletTracker initialData={initialData} />
            ) : (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-strong mb-2">
                    Loading pallet data...
                  </h2>
                  <p className="text-muted">
                    Please wait while we load your pallets
                  </p>
                </div>
              </div>
            )
          ) : (
            <LoginForm />
          )}
        </div>
      </main>
    </div>
  );
}
