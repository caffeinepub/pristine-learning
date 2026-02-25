import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import {
  walletStore, withdrawalStore, userProfileStore,
  type WithdrawalRequest,
} from '../lib/localStore';
import DashboardLayout from '../components/DashboardLayout';
import { Wallet, TrendingUp, Clock, ArrowDownCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function TeacherWalletPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-3">Login Required</h2>
          <Button onClick={() => navigate({ to: '/' })} className="btn-primary">Go to Homepage</Button>
        </div>
      </div>
    );
  }

  const principalId = identity.getPrincipal().toString();
  const profile = userProfileStore.get(principalId);
  const entries = walletStore.getEntries(principalId);
  const balance = walletStore.getBalance(principalId);
  const withdrawals = withdrawalStore.getForTeacher(principalId);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalEarned = entries.reduce((sum, e) => sum + e.net, 0);

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (amount > balance) {
      toast.error('Insufficient balance.');
      return;
    }
    setSubmitting(true);
    const req: WithdrawalRequest = {
      id: `wd_${Date.now()}`,
      teacherId: principalId,
      teacherName: profile?.name || 'Teacher',
      amount,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    withdrawalStore.add(req);
    setWithdrawAmount('');
    setSubmitting(false);
    setWithdrawalOpen(false);
    toast.success('Withdrawal request submitted! Admin will process it shortly.');
  };

  return (
    <DashboardLayout role="teacher">
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">My Wallet</h1>
            <p className="text-muted-foreground text-sm">Track your earnings and request withdrawals</p>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
            <Wallet className="w-6 h-6 mb-3 opacity-80" />
            <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
            <p className="text-primary-foreground/70 text-sm mt-1">Available Balance</p>
            <Button
              onClick={() => setWithdrawalOpen(true)}
              disabled={balance <= 0}
              className="mt-4 bg-white text-primary hover:bg-white/90 text-sm h-8 px-4"
            >
              Request Withdrawal
            </Button>
          </div>
          <div className="bg-white rounded-2xl border border-border p-5 shadow-card">
            <TrendingUp className="w-6 h-6 text-green-500 mb-3" />
            <p className="text-3xl font-bold">${totalEarned.toFixed(2)}</p>
            <p className="text-muted-foreground text-sm mt-1">Total Earned</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-5 shadow-card">
            <Clock className="w-6 h-6 text-amber-500 mb-3" />
            <p className="text-3xl font-bold">${pendingAmount.toFixed(2)}</p>
            <p className="text-muted-foreground text-sm mt-1">Pending Withdrawals</p>
          </div>
        </div>

        {/* Earnings history */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Earnings History</h2>
          </div>
          {entries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No earnings yet. Complete sessions to see your earnings here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Session Amount</TableHead>
                    <TableHead>Commission (10%)</TableHead>
                    <TableHead>Net Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(e.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">{e.studentName}</TableCell>
                      <TableCell className="text-sm">${e.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-sm text-destructive">-${e.commission.toFixed(2)}</TableCell>
                      <TableCell className="text-sm font-semibold text-green-600">${e.net.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Withdrawal history */}
        {withdrawals.length > 0 && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Withdrawal Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map(w => (
                    <TableRow key={w.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(w.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm font-medium">${w.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                          w.status === 'approved' ? 'bg-green-100 text-green-700' :
                          w.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {w.status === 'approved' ? <CheckCircle className="w-3 h-3" /> :
                           w.status === 'rejected' ? <XCircle className="w-3 h-3" /> :
                           <Clock className="w-3 h-3" />}
                          {w.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal modal */}
      <Dialog open={withdrawalOpen} onOpenChange={setWithdrawalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-primary" /> Request Withdrawal
            </DialogTitle>
            <DialogDescription>
              Available balance: <strong>${balance.toFixed(2)}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                min="1"
                max={balance}
                placeholder={`Max: $${balance.toFixed(2)}`}
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
              />
            </div>
            <Button
              onClick={handleWithdraw}
              disabled={!withdrawAmount || submitting}
              className="w-full btn-primary"
            >
              {submitting ? 'Submitting…' : 'Submit Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
