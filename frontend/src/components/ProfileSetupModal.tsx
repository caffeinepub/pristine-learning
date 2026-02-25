import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { userProfileStore, referralStore, type LocalUserProfile } from '../lib/localStore';
import { useNavigate } from '@tanstack/react-router';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, GraduationCap, Users } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export default function ProfileSetupModal({ onComplete }: Props) {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [saving, setSaving] = useState(false);

  const principalId = identity?.getPrincipal().toString() || '';

  const handleSave = async () => {
    if (!name.trim() || !principalId) return;
    setSaving(true);

    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || '';

    const profile: LocalUserProfile = {
      principalId,
      name: name.trim(),
      role,
      referralCode: refCode || undefined,
    };
    userProfileStore.save(profile);

    // Generate referral code for new user
    const myRef = referralStore.getCode(principalId);
    referralStore.registerCode(myRef);

    setSaving(false);
    onComplete();

    // Navigate to appropriate dashboard
    if (role === 'teacher') navigate({ to: '/teacher' });
    else navigate({ to: '/student' });
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-6 h-6 text-primary" />
            <DialogTitle className="font-display text-xl">Welcome to Pristine Learning!</DialogTitle>
          </div>
          <DialogDescription>
            Let's set up your profile to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Your Full Name</Label>
            <Input
              id="name"
              placeholder="e.g. Sarah Johnson"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>I am joining as a…</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRole('student')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === 'student'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <GraduationCap className="w-7 h-7" />
                <span className="font-medium text-sm">Student</span>
                <span className="text-xs text-muted-foreground text-center">Find tutors & learn</span>
              </button>
              <button
                onClick={() => setRole('teacher')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === 'teacher'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <Users className="w-7 h-7" />
                <span className="font-medium text-sm">Teacher</span>
                <span className="text-xs text-muted-foreground text-center">Teach & earn</span>
              </button>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="w-full h-11 btn-primary"
          >
            {saving ? 'Setting up…' : 'Get Started →'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
