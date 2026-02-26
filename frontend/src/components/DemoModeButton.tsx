import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { seedDemoData } from '@/utils/seedDemoData';

export const DEMO_ADMIN_SESSION_KEY = 'demoAdminSession';
export const DEMO_ADMIN_PROFILE_KEY = 'demoAdminProfile';

export function enterDemoMode(): void {
  const demoProfile = {
    fullName: 'Demo Admin',
    email: 'admin@demo.com',
    role: 'admin',
    registrationTime: new Date('2024-01-01').getTime(),
    referralCode: null,
    isActive: true,
    principal: 'demo-admin-principal',
  };
  localStorage.setItem(DEMO_ADMIN_SESSION_KEY, 'true');
  localStorage.setItem(DEMO_ADMIN_PROFILE_KEY, JSON.stringify(demoProfile));
  seedDemoData();
}

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_ADMIN_SESSION_KEY) === 'true';
}

export default function DemoModeButton() {
  const navigate = useNavigate();

  const handleEnterDemo = () => {
    enterDemoMode();
    // Use the registered route path /admin-dashboard
    navigate({ to: '/admin-dashboard' });
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-accent/60 bg-accent/5 p-6 flex flex-col items-center gap-4 text-center max-w-sm mx-auto">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent/15">
        <ShieldCheck className="w-7 h-7 text-accent" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground text-lg">Admin Demo Access</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Explore the full admin dashboard with pre-seeded demo data — no sign-up required.
        </p>
      </div>
      <Button
        onClick={handleEnterDemo}
        className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
        size="lg"
      >
        <Zap className="w-4 h-4" />
        Enter as Admin Demo
      </Button>
      <p className="text-xs text-muted-foreground">
        Demo data is stored locally and never sent to the server.
      </p>
    </div>
  );
}
