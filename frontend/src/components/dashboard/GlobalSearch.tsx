import { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, FileText, Calendar, Users, Video, MessageSquare, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  type: 'course' | 'assignment' | 'quiz' | 'announcement' | 'virtual-class' | 'student' | 'grade';
  title: string;
  subtitle?: string;
  description?: string;
  link: string;
  metadata?: any;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const isInstructor = user?.role === 'faculty' || user?.role === 'admin';
      const basePath = isInstructor ? '/instructor' : '/student';
      
      // Perform parallel searches across different modules
      const [coursesRes, assignmentsRes, announcementsRes, virtualClassesRes] = await Promise.allSettled([
        api.get(`${basePath}/courses`),
        api.get(`${basePath}/assignments`),
        isInstructor ? api.get('/instructor/announcements') : Promise.resolve({ data: { data: [] } }),
        api.get(`${basePath}/virtual-classes`)
      ]);

      const searchResults: SearchResult[] = [];

      // Process courses
      if (coursesRes.status === 'fulfilled') {
        const courses = Array.isArray(coursesRes.value.data.data) ? coursesRes.value.data.data : [];
        courses.forEach((course: any) => {
          const courseData = course.course || course;
          const courseName = courseData.courseName || '';
          const courseCode = courseData.courseCode || '';
          
          if (
            courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            courseCode.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            searchResults.push({
              id: courseData._id,
              type: 'course',
              title: courseName,
              subtitle: courseCode,
              description: `${courseData.credits || 0} Credits • ${courseData.semester || ''}`,
              link: isInstructor ? `/instructor/courses/${courseData._id}` : `/dashboard/courses/${courseData._id}`,
              metadata: courseData
            });
          }
        });
      }

      // Process assignments
      if (assignmentsRes.status === 'fulfilled') {
        const assignments = Array.isArray(assignmentsRes.value.data.data) ? assignmentsRes.value.data.data : [];
        assignments.forEach((assignment: any) => {
          if (assignment.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
            searchResults.push({
              id: assignment._id,
              type: 'assignment',
              title: assignment.title,
              subtitle: assignment.course?.courseName || 'Assignment',
              description: `Due: ${new Date(assignment.dueDate).toLocaleDateString()}`,
              link: isInstructor ? `/instructor/assignments` : `/dashboard/assignments`,
              metadata: assignment
            });
          }
        });
      }

      // Process announcements (instructor only)
      if (announcementsRes.status === 'fulfilled' && isInstructor) {
        const announcements = Array.isArray(announcementsRes.value.data.data) ? announcementsRes.value.data.data : [];
        announcements.forEach((announcement: any) => {
          if (
            announcement.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            announcement.content?.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            searchResults.push({
              id: announcement._id,
              type: 'announcement',
              title: announcement.title,
              subtitle: announcement.course?.courseName || 'Announcement',
              description: announcement.content?.substring(0, 100),
              link: `/instructor/announcements`,
              metadata: announcement
            });
          }
        });
      }

      // Process virtual classes
      if (virtualClassesRes.status === 'fulfilled') {
        const virtualClasses = Array.isArray(virtualClassesRes.value.data.data) ? virtualClassesRes.value.data.data : [];
        virtualClasses.forEach((vc: any) => {
          if (vc.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
            searchResults.push({
              id: vc._id,
              type: 'virtual-class',
              title: vc.title,
              subtitle: vc.course?.courseName || 'Virtual Class',
              description: `${new Date(vc.scheduledStartTime).toLocaleString()}`,
              link: isInstructor ? `/instructor/virtual-classroom` : `/dashboard/virtual-classes`,
              metadata: vc
            });
          }
        });
      }

      setResults(searchResults.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate
    navigate(result.link);
    setIsOpen(false);
    setQuery('');
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'assignment':
        return <FileText className="w-4 h-4" />;
      case 'announcement':
        return <MessageSquare className="w-4 h-4" />;
      case 'virtual-class':
        return <Video className="w-4 h-4" />;
      case 'student':
        return <Users className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-500/10 text-blue-500';
      case 'assignment':
        return 'bg-purple-500/10 text-purple-500';
      case 'announcement':
        return 'bg-orange-500/10 text-orange-500';
      case 'virtual-class':
        return 'bg-green-500/10 text-green-500';
      case 'student':
        return 'bg-cyan-500/10 text-cyan-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-xl mx-4 hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search courses, assignments..."
          className="pl-10 pr-10 bg-secondary/50 border-border/50"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (query.length >= 2 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full z-50"
          >
            <Card className="shadow-lg border-border/50 overflow-hidden">
              <ScrollArea className="max-h-[400px]">
                {loading ? (
                  <div className="p-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2">
                    <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                      Search Results
                    </div>
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left p-3 rounded-lg hover:bg-secondary/80 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                            {getIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">{result.title}</h4>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {result.type.replace('-', ' ')}
                              </Badge>
                            </div>
                            {result.subtitle && (
                              <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                            )}
                            {result.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {result.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No results found for "{query}"</p>
                  </div>
                ) : recentSearches.length > 0 ? (
                  <div className="p-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Recent Searches
                      </div>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                        className="w-full text-left p-3 rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-3"
                      >
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{search}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </ScrollArea>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
