import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  BookOpen,
  Users,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Globe,
  Award,
  MessageCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DemoModeButton from '../components/DemoModeButton';

const stats = [
  { label: 'Active Students', value: '2,400+', icon: Users },
  { label: 'Expert Teachers', value: '180+', icon: Award },
  { label: 'Sessions Completed', value: '12,000+', icon: BookOpen },
  { label: 'Average Rating', value: '4.8★', icon: Star },
];

const features = [
  {
    icon: Globe,
    title: 'Learn Anywhere',
    description: 'Access world-class tutors from the comfort of your home, on any device.',
  },
  {
    icon: Star,
    title: 'Verified Experts',
    description: 'Every teacher is vetted for qualifications, experience, and teaching quality.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Messaging',
    description: 'Communicate directly with your tutor before and after sessions.',
  },
  {
    icon: CheckCircle,
    title: 'Flexible Scheduling',
    description: 'Book sessions that fit your schedule with real-time availability.',
  },
  {
    icon: Award,
    title: 'Multiple Curricula',
    description: 'CBSE, ICSE, IB, GCSE, Samacheer Kalvi, SAT, IELTS and more.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Safe and transparent payments with Stripe. Cancel anytime.',
  },
];

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up in seconds with Internet Identity.' },
  { step: '02', title: 'Find a Teacher', desc: 'Browse verified tutors by subject, language, and rating.' },
  { step: '03', title: 'Book a Session', desc: 'Pick a time slot and confirm your booking instantly.' },
  { step: '04', title: 'Start Learning', desc: 'Join your session and achieve your learning goals.' },
];

const featuredTeachers = [
  { name: 'Dr. Priya Sharma', subject: 'Mathematics', rating: 4.9, sessions: 320, lang: 'English, Hindi' },
  { name: 'Mr. Arjun Nair', subject: 'Physics', rating: 4.8, sessions: 210, lang: 'English, Tamil' },
  { name: 'Ms. Kavitha Rajan', subject: 'Chemistry', rating: 4.9, sessions: 275, lang: 'English, Tamil' },
  { name: 'Mr. Rahul Verma', subject: 'Biology', rating: 4.7, sessions: 190, lang: 'English, Hindi' },
];

export default function Homepage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-medium">
                <Zap className="w-3.5 h-3.5" />
                India's Premier Online Tutoring Platform
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                Learn from the{' '}
                <span className="text-primary">Best Teachers</span>{' '}
                Across India
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Connect with verified expert tutors for personalized 1-on-1 sessions. CBSE, ICSE, IB, Samacheer Kalvi and more — all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate({ to: '/search' })}
                  className="gap-2 font-semibold"
                >
                  Find a Teacher
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ to: '/demo' })}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Take a Tour
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="/assets/generated/hero-bg.dim_1440x800.png"
                alt="Students learning online"
                className="rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Demo Access */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Explore the Admin Dashboard</h2>
            <p className="text-muted-foreground">
              See how platform administrators manage users, bookings, analytics, and more — no sign-up required.
            </p>
          </div>
          <DemoModeButton />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Why Choose Pristine Learning?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need for a world-class learning experience, built for Indian students.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground">Get started in four simple steps.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Teachers */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Featured Teachers</h2>
            <p className="text-muted-foreground">Meet some of our top-rated tutors.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTeachers.map((t) => (
              <Card key={t.name} className="border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{t.name}</h3>
                  <p className="text-xs text-accent font-medium mt-0.5">{t.subject}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">{t.rating}</span>
                    <span className="text-xs text-muted-foreground">({t.sessions} sessions)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.lang}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button onClick={() => navigate({ to: '/search' })} variant="outline" className="gap-2">
              Browse All Teachers
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Join thousands of students already achieving their academic goals with Pristine Learning.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate({ to: '/search' })}
              className="gap-2 font-semibold"
            >
              Get Started Today
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: '/demo' })}
              className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Play className="w-4 h-4" />
              Take a Tour
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
