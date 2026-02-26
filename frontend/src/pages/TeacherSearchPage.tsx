import { useState } from 'react';
import { useListTeacherProfiles } from '../hooks/useQueries';
import { TeacherProfile } from '../backend';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Search, Globe, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function TeacherSearchPage() {
  const navigate = useNavigate();
  const { data: teachers, isLoading, isError, refetch } = useListTeacherProfiles();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  const safeTeachers: TeacherProfile[] = Array.isArray(teachers) ? teachers : [];

  const allSubjects = Array.from(new Set(safeTeachers.flatMap(t => Array.isArray(t.subjects) ? t.subjects : [])));
  const allLanguages = Array.from(new Set(safeTeachers.flatMap(t => Array.isArray(t.languages) ? t.languages : [])));

  const filteredTeachers = safeTeachers.filter(teacher => {
    const name = teacher.name ?? '';
    const qualifications = teacher.qualifications ?? '';
    const subjects = Array.isArray(teacher.subjects) ? teacher.subjects : [];
    const languages = Array.isArray(teacher.languages) ? teacher.languages : [];

    const matchesSearch =
      searchQuery === '' ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qualifications.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = selectedSubject === 'all' || subjects.includes(selectedSubject);
    const matchesLanguage = selectedLanguage === 'all' || languages.includes(selectedLanguage);
    const matchesRating =
      selectedRating === 'all' ||
      (selectedRating === '4plus' && teacher.ratings >= 4) ||
      (selectedRating === '3plus' && teacher.ratings >= 3);

    return matchesSearch && matchesSubject && matchesLanguage && matchesRating;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
      />
    ));
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Unable to load teachers</h2>
          <p className="text-muted-foreground">There was a problem fetching teacher profiles. Please try again.</p>
          <Button onClick={() => refetch()} variant="default">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border py-10 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Find a Teacher</h1>
          <p className="text-muted-foreground text-lg">
            Browse our qualified teachers and find the perfect match for your learning goals.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, subject, or qualification..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {allSubjects.map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {allLanguages.map(language => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedRating} onValueChange={setSelectedRating}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Rating</SelectItem>
              <SelectItem value="4plus">4★ & above</SelectItem>
              <SelectItem value="3plus">3★ & above</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Teacher Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <h3 className="text-lg font-medium text-foreground">No teachers found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find more teachers.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setSelectedLanguage('all');
                setSelectedRating('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher, index) => {
              const subjects = Array.isArray(teacher.subjects) ? teacher.subjects : [];
              const languages = Array.isArray(teacher.languages) ? teacher.languages : [];
              const availabilitySlots = Array.isArray(teacher.availabilitySlots) ? teacher.availabilitySlots : [];

              return (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                  onClick={() => navigate({ to: '/teacher/$teacherId', params: { teacherId: String(index) } })}
                >
                  <CardContent className="p-0">
                    {/* Photo */}
                    <div className="relative h-48 bg-muted overflow-hidden">
                      {teacher.photoUrl ? (
                        <img
                          src={teacher.photoUrl}
                          alt={teacher.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <span className="text-4xl font-bold text-primary/40">
                            {teacher.name?.charAt(0)?.toUpperCase() ?? '?'}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-background/90 text-foreground font-semibold">
                          ₹{Number(teacher.hourlyRate)}/hr
                        </Badge>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg leading-tight">{teacher.name}</h3>
                        <p className="text-sm text-muted-foreground">{teacher.qualifications}</p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(teacher.ratings ?? 0)}</div>
                        <span className="text-sm font-medium text-foreground">
                          {(teacher.ratings ?? 0).toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({Number(teacher.reviewCount ?? 0)} reviews)
                        </span>
                      </div>

                      {/* Subjects */}
                      {subjects.length > 0 && (
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {subjects.slice(0, 3).map(subject => (
                              <Badge key={subject} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                            {subjects.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{subjects.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {languages.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-muted-foreground">{languages.join(', ')}</span>
                        </div>
                      )}

                      {/* Availability */}
                      {availabilitySlots.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {availabilitySlots.length} slot{availabilitySlots.length !== 1 ? 's' : ''} available
                          </span>
                        </div>
                      )}

                      <Button className="w-full mt-1" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
