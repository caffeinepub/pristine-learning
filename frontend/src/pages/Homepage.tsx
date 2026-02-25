import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useListTeacherProfiles } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { userProfileStore } from '../lib/localStore';
import ProfileSetupModal from '../components/ProfileSetupModal';
import Navbar from '../components/Navbar';
import {
  BookOpen, Globe, Shield, Brain, Star, ArrowRight, Play,
  Users, Award, Clock, CheckCircle, Heart, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TeacherProfile } from '../backend';

const CONTACT_EMAIL = 'pristinelearningofficial@gmail.com';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'star-filled' : 'star-empty'}`} />
      ))}
    </div>
  );
}

function TeacherCard({ teacher, id }: { teacher: TeacherProfile; id: string }) {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white rounded-2xl border border-border p-5 card-hover cursor-pointer shadow-card"
      onClick={() => navigate({ to: '/teacher/$teacherId', params: { teacherId: id } })}
    >
      <div className="flex items-start gap-3 mb-3">
        {teacher.photoUrl ? (
          <img src={teacher.photoUrl} alt={teacher.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {teacher.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{teacher.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{teacher.qualifications}</p>
          <div className="flex items-center gap-1 mt-1">
            <StarRating rating={teacher.ratings} />
            <span className="text-xs text-muted-foreground">({Number(teacher.reviewCount)})</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {teacher.subjects.slice(0, 3).map(s => (
          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold text-primary">${Number(teacher.hourlyRate)}/hr</span>
        <Button size="sm" variant="outline" className="text-xs h-7">View Profile</Button>
      </div>
    </div>
  );
}

export default function Homepage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: teachers = [] } = useListTeacherProfiles();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const principalId = identity?.getPrincipal().toString() || '';
  const profile = principalId ? userProfileStore.get(principalId) : null;
  const isAuthenticated = !!identity;

  // Show profile setup if authenticated but no profile
  const needsProfile = isAuthenticated && !profile;

  const featuredTeachers = teachers.slice(0, 4);

  const features = [
    { icon: <Globe className="w-6 h-6" />, title: 'Global Access', desc: 'Connect with expert tutors from 50+ countries, available 24/7 in your timezone.' },
    { icon: <Shield className="w-6 h-6" />, title: 'Secure Payments', desc: 'Industry-standard Stripe payments with automatic 90/10 revenue split.' },
    { icon: <Brain className="w-6 h-6" />, title: 'AI Study Assistant', desc: 'Generate study materials, quizzes, and personalized plans for any curriculum.' },
    { icon: <Award className="w-6 h-6" />, title: 'Verified Teachers', desc: 'All tutors are vetted with verified qualifications and student reviews.' },
    { icon: <Clock className="w-6 h-6" />, title: 'Flexible Scheduling', desc: 'Book sessions that fit your schedule with automatic timezone conversion.' },
    { icon: <BookOpen className="w-6 h-6" />, title: 'All Curricula', desc: 'CBSE, ICSE, IB, GCSE, SAT, IELTS and more — we cover every major curriculum.' },
  ];

  const steps = [
    { step: '01', title: 'Create Account', desc: 'Sign up in seconds with Internet Identity — no password needed.' },
    { step: '02', title: 'Find Your Tutor', desc: 'Search by subject, curriculum, language, or availability.' },
    { step: '03', title: 'Book a Demo', desc: 'Try a free or low-cost demo session before committing.' },
    { step: '04', title: 'Start Learning', desc: 'Join your session via Zoom link and start achieving your goals.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {needsProfile && (
        <ProfileSetupModal onComplete={() => {}} />
      )}

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-16 pb-24">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('/assets/generated/hero-bg.dim_1440x800.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
              🌍 Global Online Tutoring Marketplace
            </Badge>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground leading-tight mb-6">
              Learn from the{' '}
              <span className="text-primary">World's Best</span>{' '}
              Tutors
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Connect with expert teachers worldwide for personalized 1:1 sessions.
              CBSE, IB, GCSE, SAT, IELTS — every curriculum, every subject, every timezone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate({ to: '/search' })}
                className="btn-primary h-12 px-8 text-base"
              >
                Find a Teacher <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="h-12 px-8 text-base"
                onClick={() => {
                  if (isAuthenticated && profile) {
                    navigate({ to: profile.role === 'teacher' ? '/teacher' : '/student' });
                  } else {
                    setShowProfileSetup(true);
                  }
                }}
              >
                Get Started Free
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Free demo sessions</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> No subscription required</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> 50+ countries</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-primary-foreground">
            {[
              { value: `${teachers.length || '100'}+`, label: 'Expert Tutors' },
              { value: '50+', label: 'Countries' },
              { value: '20+', label: 'Subjects' },
              { value: '10K+', label: 'Sessions Completed' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-3xl font-bold font-display">{stat.value}</p>
                <p className="text-primary-foreground/70 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Why Choose Pristine Learning?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for world-class online education, built for students and teachers worldwide.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-border card-hover shadow-card">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Get started in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-primary/20" />
                )}
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4 shadow-md">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Teachers */}
      {featuredTeachers.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold mb-2">Featured Teachers</h2>
                <p className="text-muted-foreground">Top-rated tutors ready to help you succeed</p>
              </div>
              <Link to="/search" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredTeachers.map((t, i) => (
                <TeacherCard key={i} teacher={t} id={`teacher-${i}`} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-4xl mx-auto px-4 text-center text-primary-foreground">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Join thousands of students achieving their academic goals with Pristine Learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate({ to: '/search' })}
              className="bg-white text-primary hover:bg-white/90 h-12 px-8 font-semibold"
            >
              Find a Teacher Now
            </Button>
            <Button
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 h-12 px-8"
              onClick={() => navigate({ to: '/subscriptions' })}
            >
              View Subscription Plans
            </Button>
          </div>
        </div>
      </section>

      {/* Contact / About Section */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-5">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">Get in Touch</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Have questions about our platform, need help finding the right tutor, or want to join as a teacher?
            We'd love to hear from you.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm"
          >
            <Mail className="w-4 h-4" />
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>
    </div>
  );
}
