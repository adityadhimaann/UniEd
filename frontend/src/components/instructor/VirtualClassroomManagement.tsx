import { useState, useEffect } from 'react';
import { virtualClassService, VirtualClass } from '@/services/virtualClassService';
import { instructorService } from '@/services/instructorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, Calendar, Clock, Users, Plus, Play, StopCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function VirtualClassroom() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [virtualClasses, setVirtualClasses] = useState<VirtualClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
  });

  useEffect(() => {
    if (user?.role !== 'faculty') {
      toast.error('Access denied');
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    await fetchCourses();
    await fetchAllVirtualClasses();
  };

  const fetchCourses = async () => {
    try {
      const response = await instructorService.getMyCourses();
      setCourses(response.data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchAllVirtualClasses = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getMyCourses();
      const allCourses = response.data || [];
      
      if (allCourses.length === 0) {
        setVirtualClasses([]);
        return;
      }
      
      const allClasses: VirtualClass[] = [];
      
      for (const course of allCourses) {
        try {
          const classResponse = await virtualClassService.getCourseVirtualClasses(course._id);
          if (classResponse.data) {
            allClasses.push(...classResponse.data);
          }
        } catch (err) {
          console.error(`Error fetching classes for course ${course._id}:`, err);
        }
      }
      
      allClasses.sort((a, b) => 
        new Date(b.scheduledStartTime).getTime() - new Date(a.scheduledStartTime).getTime()
      );
      
      setVirtualClasses(allClasses);
    } catch (error: any) {
      console.error('Error fetching virtual classes:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.courseId || !formData.scheduledStartTime || !formData.scheduledEndTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        course: formData.courseId,
        scheduledStartTime: formData.scheduledStartTime,
        scheduledEndTime: formData.scheduledEndTime,
      };
      
      await virtualClassService.createVirtualClass(dataToSend);
      toast.success('Virtual class created successfully');
      setShowCreateDialog(false);
      setFormData({ title: '', description: '', courseId: '', scheduledStartTime: '', scheduledEndTime: '' });
      fetchAllVirtualClasses();
    } catch (error: any) {
      console.error('Error creating class:', error);
      toast.error(error.response?.data?.message || 'Failed to create class');
    }
  };

  const handleStartClass = async (classId: string) => {
    try {
      await virtualClassService.startVirtualClass(classId);
      toast.success('Class started successfully');
      navigate(`/instructor/virtual-class/${classId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to start class';
      if (errorMessage.includes('already live')) {
        toast.info('Class is already live, joining...');
        navigate(`/instructor/virtual-class/${classId}`);
      } else {
        toast.error(errorMessage);
      }
      fetchAllVirtualClasses();
    }
  };

  const handleEndClass = async (classId: string) => {
    try {
      await virtualClassService.endVirtualClass(classId);
      toast.success('Class ended successfully');
      fetchAllVirtualClasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to end class');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    try {
      await virtualClassService.deleteVirtualClass(classId);
      toast.success('Class deleted successfully');
      fetchAllVirtualClasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete class');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading && virtualClasses.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <img src="/loadicon.gif" alt="Loading..." className="h-48 w-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Virtual Classroom</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAllVirtualClasses} disabled={loading} size="sm" className="flex-1 sm:flex-none">
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 flex-1 sm:flex-none"
            size="sm">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create New Class</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>

      {virtualClasses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No virtual classes yet</h3>
            <p className="text-muted-foreground mb-4">Create your first virtual class to get started</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />Create Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {virtualClasses.map((vc) => (
            <Card key={vc._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg line-clamp-2">{vc.title}</CardTitle>
                <p className="text-xs md:text-sm text-muted-foreground truncate">{vc.course?.courseCode} - {vc.course?.courseName}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(vc.status)}`}>
                    {vc.status.toUpperCase()}
                  </span>
                  {vc.status === 'live' && (
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />Live Now
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {vc.description && <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{vc.description}</p>}
                <div className="space-y-2 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4" style={{ color: 'white' }} />
                    <span className="truncate">{format(new Date(vc.scheduledStartTime), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 md:h-4 md:w-4" style={{ color: 'white' }} />
                    <span className="truncate">{format(new Date(vc.scheduledStartTime), 'h:mm a')} - {format(new Date(vc.scheduledEndTime), 'h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 md:h-4 md:w-4" style={{ color: 'white' }} />
                    <span>{vc.participants.filter(p => !p.leftAt).length} participants</span>
                  </div>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  {vc.status === 'scheduled' && (
                    <Button onClick={() => handleStartClass(vc._id)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      size="sm">
                      <Play className="h-3 w-3 md:h-4 md:w-4 mr-2" />Start Class
                    </Button>
                  )}
                  {vc.status === 'live' && (
                    <>
                      <Button onClick={() => navigate(`/instructor/virtual-class/${vc._id}`)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        size="sm">
                        <Video className="h-3 w-3 md:h-4 md:w-4 mr-2" />Join
                      </Button>
                      <Button onClick={() => handleEndClass(vc._id)} variant="destructive" className="flex-1" size="sm">
                        <StopCircle className="h-3 w-3 md:h-4 md:w-4 mr-2" />End
                      </Button>
                    </>
                  )}
                  {vc.status === 'ended' && (
                    <Button onClick={() => handleDeleteClass(vc._id)} variant="outline" className="w-full" size="sm">
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-2" />Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Virtual Class</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm">Class Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., React Fundamentals Q&A" required className="text-sm" />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Textarea id="description" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..." rows={3} className="text-sm" />
            </div>
            <div>
              <Label htmlFor="course">Course *</Label>
              <select id="course" value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md" required>
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.courseCode} - {course.courseName}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input id="startTime" type="datetime-local" value={formData.scheduledStartTime}
                onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <Input id="endTime" type="datetime-local" value={formData.scheduledEndTime}
                onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })} required />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1">Create Class</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
