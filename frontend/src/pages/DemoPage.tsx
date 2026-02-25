import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Search, User, BookOpen, GraduationCap, Shield, Brain, MessageSquare,
  CreditCard, ChevronRight, ChevronLeft, Play, Star, Check, ArrowRight,
  Users, Wallet, BarChart3, Calendar, Bell, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface DemoStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  features: string[];
  illustration: React.ReactNode;
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: 'Find Your Perfect Teacher',
    subtitle: 'Smart Search & Discovery',
    icon: <Search className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    description: 'Browse our curated network of qualified teachers. Filter by subject, language, availability, and hourly rate to find the perfect match for your learning goals.',
    features: [
      'Filter by subject, language & availability',
      'View detailed teacher profiles & qualifications',
      'Read authentic student reviews & ratings',
      'Compare hourly rates across teachers',
    ],
    illustration: (
      <div className="space-y-3">
        {['Mathematics • Tamil & English • ₹500/hr', 'Science • English • ₹600/hr', 'Social Studies • Tamil • ₹400/hr'].map((t, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-medium">Teacher {i + 1}</div>
              <div className="text-white/70 text-xs">{t}</div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
              <span className="text-white text-xs">{(4.5 + i * 0.2).toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 2,
    title: 'Explore Teacher Profiles',
    subtitle: 'Detailed Profiles & Demo Videos',
    icon: <User className="w-6 h-6" />,
    color: 'from-violet-500 to-purple-600',
    description: 'Each teacher has a comprehensive profile with qualifications, experience, subjects taught, and a demo video so you can get a feel for their teaching style before booking.',
    features: [
      'Watch demo teaching videos',
      'View full qualifications & certifications',
      'See available time slots',
      'Read detailed experience summaries',
    ],
    illustration: (
      <div className="bg-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">Dr. Priya Sharma</div>
            <div className="text-white/70 text-sm">M.Sc Mathematics, 8 years exp.</div>
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-yellow-300 fill-yellow-300" />)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
          <div className="bg-white/10 rounded p-2">📚 Samacheer Kalvi</div>
          <div className="bg-white/10 rounded p-2">🌐 Tamil & English</div>
          <div className="bg-white/10 rounded p-2">⏰ Mon-Sat 9AM-6PM</div>
          <div className="bg-white/10 rounded p-2">💰 ₹500/hour</div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'Student Dashboard',
    subtitle: 'Manage Your Learning Journey',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-emerald-500 to-teal-600',
    description: 'Your personal learning hub. Track upcoming sessions, manage bookings, communicate with teachers, and monitor your progress — all in one place.',
    features: [
      'View & manage all upcoming sessions',
      'Direct messaging with teachers',
      'Track learning progress & history',
      'Referral program to earn rewards',
    ],
    illustration: (
      <div className="space-y-2">
        {[
          { icon: <Calendar className="w-4 h-4" />, label: 'Upcoming Sessions', value: '3 this week' },
          { icon: <MessageSquare className="w-4 h-4" />, label: 'Messages', value: '2 unread' },
          { icon: <Bell className="w-4 h-4" />, label: 'Notifications', value: '5 new' },
          { icon: <Users className="w-4 h-4" />, label: 'Referrals', value: '₹200 earned' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/10 rounded-lg p-2.5">
            <div className="text-white/80">{item.icon}</div>
            <span className="text-white/80 text-sm flex-1">{item.label}</span>
            <span className="text-white text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 4,
    title: 'Teacher Dashboard',
    subtitle: 'Grow Your Teaching Business',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'from-orange-500 to-amber-500',
    description: 'Teachers get a powerful dashboard to manage their sessions, track earnings, communicate with students, and grow their tutoring business on Pristine Learning.',
    features: [
      'Manage session bookings & schedule',
      'Track earnings & withdrawal requests',
      'Offer free demo sessions to attract students',
      'Communicate with students via messaging',
    ],
    illustration: (
      <div className="space-y-2">
        {[
          { icon: <Calendar className="w-4 h-4" />, label: 'Sessions Today', value: '4 sessions' },
          { icon: <Wallet className="w-4 h-4" />, label: 'Wallet Balance', value: '₹4,500' },
          { icon: <BarChart3 className="w-4 h-4" />, label: 'This Month', value: '₹18,000' },
          { icon: <Star className="w-4 h-4" />, label: 'Rating', value: '4.9 / 5.0' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/10 rounded-lg p-2.5">
            <div className="text-white/80">{item.icon}</div>
            <span className="text-white/80 text-sm flex-1">{item.label}</span>
            <span className="text-white text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 5,
    title: 'Admin Control Panel',
    subtitle: 'Complete Platform Management',
    icon: <Shield className="w-6 h-6" />,
    color: 'from-slate-600 to-gray-700',
    description: 'Admins have full control over the platform — managing bookings, approving withdrawal requests, overseeing subscriptions, and configuring payment settings.',
    features: [
      'Approve & manage all bookings',
      'Process teacher withdrawal requests',
      'Manage subscription packages',
      'Configure Stripe payment gateway',
    ],
    illustration: (
      <div className="space-y-2">
        {[
          { label: 'Pending Bookings', value: '12', color: 'text-yellow-300' },
          { label: 'Withdrawal Requests', value: '5', color: 'text-orange-300' },
          { label: 'Active Subscriptions', value: '234', color: 'text-green-300' },
          { label: 'Total Revenue', value: '₹1.2L', color: 'text-blue-300' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-white/10 rounded-lg p-2.5">
            <span className="text-white/80 text-sm">{item.label}</span>
            <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 6,
    title: 'AI Study Assistant',
    subtitle: 'Powered by Advanced AI',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-pink-500 to-rose-600',
    description: 'Our AI Study Assistant helps students with study material generation, quiz creation, note summarization, and personalized study plans — supporting Tamil Nadu Samacheer Kalvi and all major curricula.',
    features: [
      'Generate study materials for any topic',
      'Create custom quizzes & practice tests',
      'Summarize notes & textbook chapters',
      'Get personalized 8-week study plans',
    ],
    illustration: (
      <div className="space-y-3">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-white/60 text-xs mb-1">Student asks:</div>
          <div className="text-white text-sm">"Create a quiz on Class 10 Samacheer Kalvi Science Chapter 3"</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3">
          <div className="text-white/60 text-xs mb-1">AI responds:</div>
          <div className="text-white text-sm">✅ Generated 10 MCQs on Thermal Physics with answer key and explanations...</div>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    title: 'Real-Time Messaging',
    subtitle: 'Stay Connected',
    icon: <MessageSquare className="w-6 h-6" />,
    color: 'from-cyan-500 to-blue-600',
    description: 'Students and teachers can communicate directly through our built-in messaging system. Coordinate session details, share resources, and stay connected throughout the learning journey.',
    features: [
      'Direct student-teacher messaging',
      'Session coordination & reminders',
      'Share learning resources & links',
      'Notification alerts for new messages',
    ],
    illustration: (
      <div className="space-y-2">
        {[
          { from: 'Student', msg: 'Can we reschedule tomorrow\'s session?', align: 'left' },
          { from: 'Teacher', msg: 'Sure! How about 4 PM instead?', align: 'right' },
          { from: 'Student', msg: 'Perfect, 4 PM works great!', align: 'left' },
        ].map((m, i) => (
          <div key={i} className={`flex ${m.align === 'right' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-2.5 text-sm ${
              m.align === 'right' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/90'
            }`}>
              <div className="text-xs text-white/60 mb-1">{m.from}</div>
              {m.msg}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 8,
    title: 'Payments & Wallet',
    subtitle: 'Secure Stripe Payments',
    icon: <CreditCard className="w-6 h-6" />,
    color: 'from-indigo-500 to-violet-600',
    description: 'All payments are securely processed through Stripe. Students subscribe to plans or pay for individual sessions. Teachers receive 90% of session fees directly to their wallet and can request withdrawals anytime.',
    features: [
      'Secure checkout powered by Stripe',
      'Flexible subscription plans ($3, $10, $20/month)',
      'Teachers earn 90% of session fees',
      'Easy wallet withdrawal requests',
    ],
    illustration: (
      <div className="space-y-3">
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <div className="text-white/60 text-xs mb-1">Secure Payment via</div>
          <div className="text-white font-bold text-lg flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Stripe
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { plan: 'Basic', price: '$3' },
            { plan: 'Standard', price: '$10' },
            { plan: 'Premium', price: '$20' },
          ].map((p, i) => (
            <div key={i} className="bg-white/10 rounded-lg p-2">
              <div className="text-white text-sm font-bold">{p.price}</div>
              <div className="text-white/60 text-xs">{p.plan}/mo</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2.5">
          <Wallet className="w-4 h-4 text-white/80" />
          <span className="text-white/80 text-sm flex-1">Teacher Wallet</span>
          <span className="text-green-300 text-sm font-medium">90% earnings</span>
        </div>
      </div>
    ),
  },
];

export default function DemoPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const step = demoSteps[currentStep];
  const progress = ((currentStep + 1) / demoSteps.length) * 100;

  const goNext = () => {
    if (currentStep < demoSteps.length - 1) setCurrentStep(currentStep + 1);
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Platform Tour</h1>
              <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {demoSteps.length}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: '/' })}>
            Exit Tour
          </Button>
        </div>
        <div className="max-w-4xl mx-auto mt-3">
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {step.subtitle}
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-3">{step.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>

            <ul className="space-y-3">
              {step.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Navigation */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < demoSteps.length - 1 ? (
                <Button onClick={goNext} className="flex items-center gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Right: Illustration */}
          <div className={`rounded-2xl bg-gradient-to-br ${step.color} p-6 min-h-[300px] flex flex-col justify-between`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                {step.icon}
              </div>
              <div>
                <div className="text-white font-semibold">{step.title}</div>
                <div className="text-white/70 text-sm">{step.subtitle}</div>
              </div>
            </div>
            {step.illustration}
          </div>
        </div>

        {/* Step Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {demoSteps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`transition-all duration-200 rounded-full ${
                i === currentStep
                  ? 'w-6 h-2.5 bg-primary'
                  : 'w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Overview Grid */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">All Platform Features</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {demoSteps.map((s, i) => (
              <Card
                key={s.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  i === currentStep ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setCurrentStep(i)}
              >
                <CardContent className="p-3 text-center">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white mx-auto mb-2`}>
                    {s.icon}
                  </div>
                  <div className="text-xs font-medium text-foreground leading-tight">{s.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
