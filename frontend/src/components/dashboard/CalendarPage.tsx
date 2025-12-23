import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import eventService, { Event } from "@/services/eventService";
import { instructorService } from "@/services/instructorService";
import { toast } from "sonner";
import { format } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getEventTypeColor(type: string) {
  switch (type) {
    case "lecture": return "bg-blue-100 text-blue-800 border-blue-200";
    case "deadline": return "bg-red-100 text-red-800 border-red-200";
    case "assignment": return "bg-red-100 text-red-800 border-red-200";
    case "meeting": return "bg-purple-100 text-purple-800 border-purple-200";
    case "office-hours": return "bg-green-100 text-green-800 border-green-200";
    case "lab": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "exam": return "bg-orange-100 text-orange-800 border-orange-200";
    case "virtual-class": return "bg-cyan-100 text-cyan-800 border-cyan-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'other' as Event['type'],
    startDate: '',
    startTime: '',
    endTime: '',
    location: '',
    course: '',
    isAllDay: false,
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0).toISOString();
      
      const eventsRes = await eventService.getMyEvents({ startDate, endDate });
      setEvents(eventsRes.data || []);

      if (user?.role === 'faculty') {
        const coursesRes = await instructorService.getMyCourses();
        setCourses(coursesRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventService.createEvent({
        ...formData,
        course: formData.course || undefined,
      });
      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        type: 'other',
        startDate: '',
        startTime: '',
        endTime: '',
        location: '',
        course: '',
        isAllDay: false,
      });
      fetchData();
      toast.success('Event created successfully');
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => {
      const eventDate = new Date(e.startDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const selectedEvents = selectedDate 
    ? events.filter(e => {
        const eventDate = new Date(e.startDate).toISOString().split('T')[0];
        return eventDate === selectedDate;
      })
    : [];

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1">Manage your schedule and events</p>
        </div>
        {user?.role === "faculty" && (
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        )}
      </motion.div>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Event['type'] })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  required
                >
                  <option value="lecture">Lecture</option>
                  <option value="meeting">Meeting</option>
                  <option value="office-hours">Office Hours</option>
                  <option value="lab">Lab</option>
                  <option value="exam">Exam</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course (Optional)</Label>
                <select
                  id="course"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="">None</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseCode}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Room number or online link"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500">
                Create Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-xl p-6 border bg-card">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {months[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }
              
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = getEventsForDate(day);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square p-1 rounded-lg transition-all relative ${
                    isSelected 
                      ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white" 
                      : isToday
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                        : "hover:bg-secondary"
                  }`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            event.type === "deadline" || event.type === "assignment" ? "bg-red-500" : "bg-blue-500"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
            {[
              { type: "lecture", label: "Lecture" },
              { type: "deadline", label: "Deadline" },
              { type: "meeting", label: "Meeting" },
              { type: "lab", label: "Lab" },
              { type: "virtual-class", label: "Virtual Class" },
            ].map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <Badge variant="outline" className={getEventTypeColor(item.type)}>
                  {item.label}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Events sidebar */}
        <motion.div variants={itemVariants} className="rounded-xl p-6 border bg-card">
          <h3 className="font-semibold text-lg mb-4">
            {selectedDate 
              ? `Events for ${format(new Date(selectedDate), 'MMMM d')}`
              : "Select a date"
            }
          </h3>
          
          {selectedEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedEvents.map((event) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border ${getEventTypeColor(event.type)}`}
                >
                  <h4 className="font-medium mb-2">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm mb-2">{event.description}</p>
                  )}
                  <div className="space-y-1 text-sm">
                    {event.startTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{event.startTime}{event.endTime && ` - ${event.endTime}`}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.course && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        <span>{event.course.courseCode}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : selectedDate ? (
            <p className="text-muted-foreground text-sm">No events scheduled for this day.</p>
          ) : (
            <p className="text-muted-foreground text-sm">Click on a date to view events.</p>
          )}

          {/* Upcoming events */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3">Upcoming Events</h4>
            <div className="space-y-2">
              {events
                .filter(e => new Date(e.startDate) >= new Date())
                .slice(0, 5)
                .map((event) => (
                  <div key={event._id} className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === "deadline" || event.type === "assignment" ? "bg-red-500" : "bg-blue-500"
                    }`} />
                    <span className="flex-1 truncate">{event.title}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(event.startDate), 'MMM d')}
                    </span>
                  </div>
                ))}
              {events.filter(e => new Date(e.startDate) >= new Date()).length === 0 && (
                <p className="text-muted-foreground text-sm">No upcoming events</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
