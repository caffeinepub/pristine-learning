import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, Filter, Star, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useListTeacherProfiles } from '../hooks/useQueries';
import { useLanguage } from '../i18n/LanguageContext';

export default function TeacherSearchPage() {
  const navigate = useNavigate();
  const { data: teachersRaw, isLoading, isError, error, refetch } = useListTeacherProfiles();
  const { t } = useLanguage();

  // Always ensure teachers is a safe array
  const teachers = Array.isArray(teachersRaw) ? teachersRaw : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [minRating, setMinRating] = useState('');

  const allSubjects = Array.from(new Set(teachers.flatMap((t) => t.subjects ?? [])));
  const allLanguages = Array.from(new Set(teachers.flatMap((t) => t.languages ?? [])));

  const filtered = teachers.filter((teacher) => {
    if (!teacher) return false;
    const matchesSearch =
      !searchQuery ||
      (teacher.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.subjects ?? []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = !selectedSubject || (teacher.subjects ?? []).includes(selectedSubject);
    const matchesLanguage = !selectedLanguage || (teacher.languages ?? []).includes(selectedLanguage);
    const matchesRating = !minRating || (teacher.ratings ?? 0) >= parseFloat(minRating);
    return matchesSearch && matchesSubject && matchesLanguage && matchesRating;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedLanguage('');
    setMinRating('');
  };

  const hasFilters = searchQuery || selectedSubject || selectedLanguage || minRating;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('teacherSearch.title')}</h1>
        <p className="text-muted-foreground">{t('teacherSearch.subtitle')}</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('teacherSearch.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 shrink-0">
              <X className="w-4 h-4" />
              {t('teacherSearch.filters.clearFilters')}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{t('teacherSearch.filters.title')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder={t('teacherSearch.filters.allSubjects')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('teacherSearch.filters.allSubjects')}</SelectItem>
              {allSubjects.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue placeholder={t('teacherSearch.filters.allLanguages')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('teacherSearch.filters.allLanguages')}</SelectItem>
              {allLanguages.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger>
              <SelectValue placeholder={t('teacherSearch.filters.anyRating')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('teacherSearch.filters.anyRating')}</SelectItem>
              {[4, 3, 2, 1].map((r) => (
                <SelectItem key={r} value={String(r)}>
                  {r}+ {t('teacherSearch.filters.stars')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && !isError && (
        <div className="mb-4 text-sm text-muted-foreground">
          {t('teacherSearch.results.showing')}{' '}
          <span className="font-medium text-foreground">{filtered.length}</span>{' '}
          {t('teacherSearch.results.teachers')}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex gap-1.5 mb-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Unable to load teachers</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {error instanceof Error
              ? error.message
              : 'Something went wrong while loading teacher profiles. Please try again.'}
          </p>
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium mb-1">{t('teacherSearch.results.noResults')}</p>
          <p className="text-sm text-muted-foreground mb-4">{t('teacherSearch.results.tryAdjusting')}</p>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1.5">
              <X className="w-4 h-4" />
              {t('teacherSearch.filters.clearFilters')}
            </Button>
          )}
        </div>
      )}

      {/* Teacher cards */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((teacher, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {(teacher.name ?? '?').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{teacher.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{teacher.qualifications}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(teacher.subjects ?? []).slice(0, 3).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-medium">{(teacher.ratings ?? 0).toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({Number(teacher.reviewCount ?? 0)} {t('teacherSearch.teacherCard.reviews')})
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    ₹{Number(teacher.hourlyRate ?? 0)}{t('teacherSearch.teacherCard.perHour')}
                  </span>
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => navigate({ to: `/teacher/${idx}` })}
                >
                  {t('teacherSearch.teacherCard.viewProfile')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
