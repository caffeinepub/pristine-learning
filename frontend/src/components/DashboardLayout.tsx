import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { userProfileStore, notificationsStore } from '../lib/localStore';
import {
  Menu, X, LogOut, Bell, BookOpen, LayoutDashboard,
  Search, Calendar, Wallet, MessageSquare, Video,
  Users, BarChart3, Settings, FileText, Package,
  Star, Brain, Gift, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

interface Props {
  children: ReactNode;
  role: 'admin' | 'teacher' | 'student';
}

const adminNav: NavItem[] = [
  { label: 'Overview', to: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Users', to: '/admin', icon: <Users className="w-4 h-4" /> },
  { label: 'Bookings', to: '/admin', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Withdrawals', to: '/admin', icon: <Wallet className="w-4 h-4" /> },
  { label: 'Subscriptions', to: '/admin', icon: <Package className="w-4 h-4" /> },
  { label: 'Blog', to: '/admin', icon: <FileText className="w-4 h-4" /> },
  { label: 'Analytics', to: '/admin', icon: <BarChart3 className="w-4 h-4" /> },
  { label: 'Referrals', to: '/admin', icon: <Gift className="w-4 h-4" /> },
];

const teacherNav: NavItem[] = [
  { label: 'Dashboard', to: '/teacher', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'My Sessions', to: '/teacher', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Demo Slots', to: '/teacher', icon: <Star className="w-4 h-4" /> },
  { label: 'Wallet', to: '/teacher/wallet', icon: <Wallet className="w-4 h-4" /> },
  { label: 'Messages', to: '/teacher', icon: <MessageSquare className="w-4 h-4" /> },
  { label: 'Referrals', to: '/teacher', icon: <Gift className="w-4 h-4" /> },
];

const studentNav: NavItem[] = [
  { label: 'Dashboard', to: '/student', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Find Teachers', to: '/search', icon: <Search className="w-4 h-4" /> },
  { label: 'My Bookings', to: '/student', icon: <Calendar className="w-4 h-4" /> },
  { label: 'AI Assistant', to: '/student/ai-assistant', icon: <Brain className="w-4 h-4" /> },
  { label: 'Messages', to: '/student', icon: <MessageSquare className="w-4 h-4" /> },
  { label: 'Recordings', to: '/student/recordings', icon: <Video className="w-4 h-4" /> },
  { label: 'Subscriptions', to: '/subscriptions', icon: <Package className="w-4 h-4" /> },
  { label: 'Referrals', to: '/student', icon: <Gift className="w-4 h-4" /> },
];

export default function DashboardLayout({ children, role }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { identity, clear } = useInternetIdentity();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const principalId = identity?.getPrincipal().toString() || '';
  const profile = principalId ? userProfileStore.get(principalId) : null;
  const notifications = principalId ? notificationsStore.getForUser(principalId) : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = role === 'admin' ? adminNav : role === 'teacher' ? teacherNav : studentNav;

  const handleLogout = async () => {
    await clear();
    qc.clear();
    navigate({ to: '/' });
  };

  const roleLabel = role === 'admin' ? 'Admin' : role === 'teacher' ? 'Teacher' : 'Student';
  const roleBadgeColor = role === 'admin' ? 'bg-destructive/10 text-destructive' :
    role === 'teacher' ? 'bg-accent/20 text-accent-foreground' :
    'bg-primary/10 text-primary';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-sidebar-primary" />
          <span className="font-display font-bold text-sidebar-foreground text-lg">Pristine</span>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-bold">
            {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {profile?.name || 'User'}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor}`}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="sidebar-link"
              activeProps={{ className: 'sidebar-link sidebar-link-active' }}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-sidebar shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-sidebar flex flex-col animate-slide-in">
            <button
              className="absolute top-4 right-4 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 shrink-0">
          <button
            className="lg:hidden p-2 rounded-md text-foreground/60 hover:text-primary"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-3 py-2 font-semibold text-sm border-b">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">No notifications</div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <DropdownMenuItem
                      key={n.id}
                      className={`flex flex-col items-start gap-0.5 py-2 ${!n.read ? 'bg-primary/5' : ''}`}
                      onClick={() => notificationsStore.markRead(n.id)}
                    >
                      <span className="font-medium text-xs">{n.title}</span>
                      <span className="text-xs text-muted-foreground">{n.message}</span>
                    </DropdownMenuItem>
                  ))
                )}
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-xs text-center text-primary justify-center"
                      onClick={() => notificationsStore.markAllRead(principalId)}
                    >
                      Mark all as read
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              ← Home
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
