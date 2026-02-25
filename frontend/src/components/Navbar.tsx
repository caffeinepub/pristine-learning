import { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Menu, X, GraduationCap, Play, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/LanguageContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { t, currentLanguage, setLanguage } = useLanguage();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const toggleLanguage = () => {
    const next: Language = currentLanguage === 'en' ? 'ta' : 'en';
    setLanguage(next);
  };

  const navLinks = [
    { label: t('navbar.findTeacher'), path: '/search' },
    { label: t('navbar.aiAssistant'), path: '/ai-assistant' },
    { label: t('navbar.tour'), path: '/demo', icon: <Play className="w-3.5 h-3.5" /> },
    { label: t('navbar.blog'), path: '/blog' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity"
          >
            <GraduationCap className="w-7 h-7" />
            <span className="hidden sm:block">Pristine Learning</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate({ to: link.path })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-accent transition-colors"
              title={currentLanguage === 'en' ? 'Switch to Tamil' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-foreground">
                {currentLanguage === 'en' ? 'EN' : 'தமிழ்'}
              </span>
            </button>

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/student-dashboard' })}
              >
                {t('navbar.dashboard')}
              </Button>
            )}

            <Button
              size="sm"
              variant={isAuthenticated ? 'outline' : 'default'}
              onClick={handleAuth}
              disabled={isLoggingIn}
            >
              {isLoggingIn
                ? `${t('navbar.login')}...`
                : isAuthenticated
                ? t('navbar.logout')
                : t('navbar.login')}
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {/* Language Switcher Mobile */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-accent transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-foreground text-xs">
                {currentLanguage === 'en' ? 'EN' : 'தமிழ்'}
              </span>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate({ to: link.path });
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}

            <div className="pt-2 border-t border-border space-y-1">
              {isAuthenticated && (
                <button
                  onClick={() => {
                    navigate({ to: '/student-dashboard' });
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {t('navbar.dashboard')}
                </button>
              )}
              <Button
                size="sm"
                variant={isAuthenticated ? 'outline' : 'default'}
                onClick={() => {
                  handleAuth();
                  setMobileOpen(false);
                }}
                disabled={isLoggingIn}
                className="w-full"
              >
                {isLoggingIn
                  ? `${t('navbar.login')}...`
                  : isAuthenticated
                  ? t('navbar.logout')
                  : t('navbar.login')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
