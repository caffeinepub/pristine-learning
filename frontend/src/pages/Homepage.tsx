import { useNavigate } from '@tanstack/react-router';
import { Star, Users, BookOpen, Award, Brain, Shield, TrendingUp, Globe, Play, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useListTeacherProfiles } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLanguage } from '../i18n/LanguageContext';

export default function Homepage() {
  const navigate = useNavigate();
  const { data: teachers = [] } = useListTeacherProfiles();
  const { identity } = useInternetIdentity();
  const { t } = useLanguage();

  const featuredTeachers = teachers.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 lg:py-28">
        <div className="absolute inset-0 opacity-5">
          <img src="/assets/generated/hero-bg.dim_1440x800.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4 fill-primary" />
            {t('homepage.hero.badge')}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            {t('homepage.hero.heading')}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('homepage.hero.subheading')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate({ to: '/search' })} className="gap-2">
              <BookOpen className="w-5 h-5" />
              {t('homepage.hero.findTeacher')}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ to: '/demo' })} className="gap-2">
              <Play className="w-5 h-5" />
              {t('homepage.hero.takeTour')}
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: t('homepage.stats.teachers'), icon: <Users className="w-6 h-6" /> },
              { value: '10,000+', label: t('homepage.stats.students'), icon: <BookOpen className="w-6 h-6" /> },
              { value: '50,000+', label: t('homepage.stats.sessions'), icon: <Award className="w-6 h-6" /> },
              { value: '4.9', label: t('homepage.stats.rating'), icon: <Star className="w-6 h-6 fill-primary" /> },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="text-primary">{stat.icon}</div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">{t('homepage.features.title')}</h2>
            <p className="text-muted-foreground">{t('homepage.features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Users className="w-6 h-6" />, key: 'expertTeachers' },
              { icon: <BookOpen className="w-6 h-6" />, key: 'flexibleScheduling' },
              { icon: <Brain className="w-6 h-6" />, key: 'aiAssistant' },
              { icon: <Shield className="w-6 h-6" />, key: 'securePayments' },
              { icon: <TrendingUp className="w-6 h-6" />, key: 'progressTracking' },
              { icon: <Globe className="w-6 h-6" />, key: 'multilingualSupport' },
            ].map((feature) => (
              <Card key={feature.key} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t(`homepage.features.${feature.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`homepage.features.${feature.key}.description`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">{t('homepage.howItWorks.title')}</h2>
            <p className="text-muted-foreground">{t('homepage.howItWorks.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(['step1', 'step2', 'step3', 'step4'] as const).map((step, idx) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {idx + 1}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t(`homepage.howItWorks.${step}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`homepage.howItWorks.${step}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Teachers */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">{t('homepage.featuredTeachers.title')}</h2>
            <p className="text-muted-foreground">{t('homepage.featuredTeachers.subtitle')}</p>
          </div>
          {featuredTeachers.length === 0 ? (
            <p className="text-center text-muted-foreground">{t('homepage.featuredTeachers.noTeachers')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTeachers.map((teacher, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{teacher.name}</h3>
                        <p className="text-sm text-muted-foreground">{teacher.subjects.slice(0, 2).join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="font-medium">{teacher.ratings.toFixed(1)}</span>
                        <span className="text-muted-foreground">({Number(teacher.reviewCount)})</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        ₹{Number(teacher.hourlyRate)}{t('homepage.featuredTeachers.perHour')}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate({ to: `/teacher/${idx}` })}
                    >
                      {t('homepage.featuredTeachers.viewProfile')}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('homepage.cta.title')}</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">{t('homepage.cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate({ to: '/search' })}
              className="gap-2"
            >
              <BookOpen className="w-5 h-5" />
              {t('homepage.cta.findTeacher')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: '/demo' })}
              className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Play className="w-5 h-5" />
              {t('homepage.cta.takeTour')}
            </Button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('homepage.contact.title')}</h2>
          <p className="text-muted-foreground mb-4">{t('homepage.contact.subtitle')}</p>
          <a
            href="mailto:pristinelearningofficial@gmail.com"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            <Mail className="w-4 h-4" />
            {t('homepage.contact.email')}: pristinelearningofficial@gmail.com
          </a>
        </div>
      </section>
    </div>
  );
}
