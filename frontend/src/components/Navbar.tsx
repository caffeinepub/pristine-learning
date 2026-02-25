import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, BookOpen, Bell, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { userProfileStore } from '../lib/localStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const principalId = identity?.getPrincipal().toString() || '';
  const profile = principalId ? userProfileStore.get(principalId) : null;

  const handleLogout = async () => {
    await clear();
    qc.clear();
    navigate({ to: '/' });
  };

  const getDashboardPath = () => {
    if (!profile) return '/student';
    if (profile.role === 'admin') return '/admin';
    if (profile.role === 'teacher') return '/teacher';
    return '/student';
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Find Teachers', to: '/search' },
    { label: 'Blog', to: '/blog' },
    { label: 'Subscriptions', to: '/subscriptions' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/assets/generated/pristine-logo.dim_400x120.png"
              alt="Pristine Learning"
              className="h-9 w-auto"
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = 'none';
                const sibling = t.nextElementSibling as HTMLElement;
                if (sibling) sibling.style.display = 'flex';
              }}
            />
            <span className="hidden items-center gap-1.5 text-xl font-display font-bold text-primary">
              <BookOpen className="w-6 h-6 text-accent" />
              Pristine Learning
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-primary rounded-md transition-colors"
                activeProps={{ className: 'text-primary font-semibold' }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                      {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">{profile?.name || 'User'}</span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate({ to: getDashboardPath() })}>
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={login} disabled={isLoggingIn} className="btn-primary">
                {isLoggingIn ? 'Logging in…' : 'Login / Sign Up'}
              </Button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-foreground/70 hover:text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="block px-3 py-2 text-sm font-medium text-foreground/70 hover:text-primary rounded-md"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => { navigate({ to: getDashboardPath() }); setMobileOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-foreground/70 hover:text-primary rounded-md"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-destructive rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Button onClick={login} disabled={isLoggingIn} className="w-full btn-primary">
                  {isLoggingIn ? 'Logging in…' : 'Login / Sign Up'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
