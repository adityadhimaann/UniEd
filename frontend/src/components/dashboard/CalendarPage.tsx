import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const events = [
  {
    id: 1,
    title: "Data Structures Lecture",
    date: "2024-12-10",
    time: "09:00 AM",
    location: "Room 301",
    type: "lecture",
    course: "CS301",
  },
  {
    id: 2,
    title: "Project Deadline",
    date: "2024-12-15",
    time: "11:59 PM",
    type: "deadline",
    course: "CS301",
  },
  {
    id: 3,
    title: "Faculty Meeting",
    date: "2024-12-12",
    time: "02:00 PM",
    location: "Conference Room A",
    type: "meeting",
  },
  {
    id: 4,
    title: "Office Hours",
    date: "2024-12-11",
    time: "03:00 PM",
    location: "Office 205",
    type: "office-hours",
  },
  {
    id: 5,
    title: "Database Systems Lab",
    date: "2024-12-13",
    time: "10:00 AM",
    location: "Lab 102",
    type: "lab",
    course: "CS302",
  },
];

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
    case "lecture": return "bg-primary/20 text-primary border-primary/30";
    case "deadline": return "bg-destructive/20 text-destructive border-destructive/30";
    case "meeting": return "bg-info/20 text-info border-info/30";
    case "office-hours": return "bg-success/20 text-success border-success/30";
    case "lab": return "bg-warning/20 text-warning border-warning/30";
    default: return "bg-muted text-muted-foreground";
  }
}

export function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1)); // December 2024
  const [selectedDate, setSelectedDate] = useState<string | null>("2024-12-10");

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

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedEvents = selectedDate 
    ? events.filter(e => e.date === selectedDate)
    : [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            {user?.role === "faculty" ? "Manage your schedule and classes" : "View your upcoming classes and deadlines"}
          </p>
        </div>
        {user?.role === "faculty" && (
          <Button className="bg-gradient-to-r from-primary to-accent">
            Add Event
          </Button>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass rounded-xl p-6 border border-border/50">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold font-display">
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
              const isToday = day === 10 && month === 11 && year === 2024; // Mock today

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square p-1 rounded-lg transition-all relative ${
                    isSelected 
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" 
                      : isToday
                        ? "bg-primary/20 text-primary"
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
                            event.type === "deadline" ? "bg-destructive" : "bg-primary"
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
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border/50">
            {[
              { type: "lecture", label: "Lecture" },
              { type: "deadline", label: "Deadline" },
              { type: "meeting", label: "Meeting" },
              { type: "lab", label: "Lab" },
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
        <motion.div variants={itemVariants} className="glass rounded-xl p-6 border border-border/50">
          <h3 className="font-semibold text-lg mb-4">
            {selectedDate 
              ? `Events for ${new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
              : "Select a date"
            }
          </h3>
          
          {selectedEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border ${getEventTypeColor(event.type)}`}
                >
                  <h4 className="font-medium mb-2">{event.title}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{event.time}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.course && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        <span>{event.course}</span>
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
          <div className="mt-6 pt-6 border-t border-border/50">
            <h4 className="font-medium mb-3">Upcoming This Week</h4>
            <div className="space-y-2">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    event.type === "deadline" ? "bg-destructive" : "bg-primary"
                  }`} />
                  <span className="flex-1 truncate">{event.title}</span>
                  <span className="text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
