import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListTeacherProfiles } from '../hooks/useQueries';
import Navbar from '../components/Navbar';
import { Search, Filter, Star, MapPin, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { TeacherProfile } from '../backend';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics', 'French', 'Spanish'];
const LANGUAGES = ['English', 'Hindi', 'French', 'Spanish', 'Arabic', 'Mandarin', 'German'];
const GRADES = ['Primary (1-5)', 'Middle (6-8)', 'High School (9-12)', 'University', 'Adult Learning'];

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
    <div className="bg-white rounded-2xl border border-border p-5 card-hover shadow-card">
      <div className="flex gap-4">
        {teacher.photoUrl ? (
          <img src={teacher.photoUrl} alt={teacher.name} className="w-16 h-16 rounded-xl object-cover border border-border shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
            {teacher.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{teacher.name}</h3>
              <p className="text-xs text-muted-foreground">{teacher.qualifications}</p>
            </div>
            <span className="font-bold text-primary text-sm shrink-0">${Number(teacher.hourlyRate)}/hr</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={teacher.ratings} />
            <span className="text-xs text-muted-foreground">({Number(teacher.reviewCount)} reviews)</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{teacher.experience}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {teacher.subjects.slice(0, 4).map(s => (
          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
        ))}
        {teacher.subjects.length > 4 && (
          <Badge variant="outline" className="text-xs">+{teacher.subjects.length - 4}</Badge>
        )}
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        {teacher.languages.length > 0 && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {teacher.languages.slice(0, 2).join(', ')}
          </span>
        )}
        {teacher.availabilitySlots.length > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {teacher.availabilitySlots.length} slots
          </span>
        )}
      </div>
      <Button
        className="w-full mt-4 btn-primary"
        onClick={() => navigate({ to: '/teacher/$teacherId', params: { teacherId: id } })}
      >
        View Profile
      </Button>
    </div>
  );
}

export default function TeacherSearchPage() {
  const { data: teachers = [], isLoading } = useListTeacherProfiles();
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState('');
  const [grade, setGrade] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) &&
        !t.subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
      if (subject && !t.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()))) return false;
      if (language && !t.languages.some(l => l.toLowerCase().includes(language.toLowerCase()))) return false;
      return true;
    });
  }, [teachers, search, subject, language]);

  const clearFilters = () => {
    setSearch('');
    setSubject('');
    setLanguage('');
    setGrade('');
  };

  const hasFilters = !!(search || subject || language || grade);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Find Your Perfect Tutor</h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading teachers…' : `${filtered.length} teacher${filtered.length !== 1 ? 's' : ''} available`}
          </p>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or subject…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
          <Button
            variant="outline"
            className="h-11 gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasFilters && <span className="ml-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">!</span>}
          </Button>
        </div>

        {showFilters && (
          <div className="bg-white border border-border rounded-xl p-4 mb-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger><SelectValue placeholder="Grade Level" /></SelectTrigger>
                <SelectContent>
                  {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-3 text-muted-foreground">
                <X className="w-3.5 h-3.5 mr-1" /> Clear filters
              </Button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-5 space-y-3">
                <div className="flex gap-4">
                  <Skeleton className="w-16 h-16 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No teachers found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t, i) => (
              <TeacherCard key={i} teacher={t} id={`teacher-${i}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
