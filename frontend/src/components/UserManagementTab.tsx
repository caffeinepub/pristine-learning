import React, { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllUserProfiles } from '../hooks/useQueries';
import UserDetailPanel from './UserDetailPanel';
import { DemoUserProfile, getDemoActivityLogs, getDemoPerformanceMetrics } from '../utils/seedDemoData';
import type { UserProfile } from '../backend';

interface UserManagementTabProps {
  demoMode?: boolean;
  demoUsers?: DemoUserProfile[];
}

interface DisplayUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  registrationTime: number;
  referralCode: string | null;
  isActive: boolean;
  isDemo?: boolean;
}

export default function UserManagementTab({ demoMode = false, demoUsers = [] }: UserManagementTabProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<DisplayUser | null>(null);

  const { data: backendUsers = [], isLoading } = useGetAllUserProfiles();

  // Build display list
  const displayUsers: DisplayUser[] = demoMode
    ? demoUsers.map((u) => ({
        id: u.principal,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        registrationTime: u.registrationTime,
        referralCode: u.referralCode,
        isActive: u.isActive,
        isDemo: true,
      }))
    : (backendUsers as UserProfile[]).map((u, i) => ({
        id: `user-${i}`,
        fullName: u.fullName,
        email: u.email,
        role: typeof u.role === 'object' ? Object.keys(u.role)[0] : String(u.role),
        registrationTime: Number(u.registrationTime),
        referralCode: u.referralCode ?? null,
        isActive: u.isActive,
        isDemo: false,
      }));

  const filtered = displayUsers.filter((u) => {
    const matchSearch =
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.isActive) ||
      (statusFilter === 'inactive' && !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    user: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    guest: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  if (isLoading && !demoMode) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="guest">Guest</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing <strong className="text-foreground">{filtered.length}</strong> of{' '}
          <strong className="text-foreground">{displayUsers.length}</strong> users
        </span>
        {demoMode && (
          <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-700 dark:text-amber-400">
            Demo Data
          </Badge>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Registered</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Referral Code</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{user.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${roleColors[user.role] || roleColors.guest}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {new Date(user.registrationTime).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {user.referralCode ? (
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{user.referralCode}</code>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                      className="gap-1.5 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          demoMode={demoMode}
          demoActivityLogs={demoMode ? getDemoActivityLogs(selectedUser.id) : []}
          demoMetrics={demoMode ? (getDemoPerformanceMetrics(selectedUser.id) as any) : null}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
