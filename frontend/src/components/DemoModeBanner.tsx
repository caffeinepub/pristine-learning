import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEMO_ADMIN_SESSION_KEY, DEMO_ADMIN_PROFILE_KEY } from './DemoModeButton';
import { clearDemoData } from '@/utils/seedDemoData';

export default function DemoModeBanner() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('demoBannerDismissed') === 'true'
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('demoBannerDismissed', 'true');
    setDismissed(true);
  };

  const handleExitDemo = () => {
    localStorage.removeItem(DEMO_ADMIN_SESSION_KEY);
    localStorage.removeItem(DEMO_ADMIN_PROFILE_KEY);
    clearDemoData();
    sessionStorage.removeItem('demoBannerDismissed');
    navigate({ to: '/' });
  };

  return (
    <div className="w-full bg-amber-500/15 border border-amber-500/40 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
      <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
          Admin Demo Mode
        </span>
        <span className="text-amber-700 dark:text-amber-400 text-sm ml-2">
          You are viewing pre-seeded demo data. Changes are local only and not saved to the backend.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExitDemo}
          className="gap-1.5 border-amber-500/50 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          Exit Demo
        </Button>
        <button
          onClick={handleDismiss}
          className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
