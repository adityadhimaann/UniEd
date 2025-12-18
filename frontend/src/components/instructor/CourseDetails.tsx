import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { instructorService } from '@/services/instructorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Calendar, Bell, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CourseDetails() {
  const { courseId } = useParams();
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingAssignment, setViewingAssignment] = useState<any>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [studentsRes, assignmentsRes, announcementsRes] = await Promise.all([
        instructorService.getCourseStudents(courseId!),
        instructorService.getCourseAssignments(courseId!),
        instructorService.getCourseAnnouncements(courseId!),
      ]);
      setStudents(studentsRes.data);
      setAssignments(assignmentsRes.data);
      setAnnouncements(announcementsRes.data);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <img src="/loadicon.gif" alt="Loading..." className="h-48 w-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
          className="border-gray-600 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Course Details</h1>
          <p className="text-gray-300 mt-1">Manage students, assignments, and announcements</p>
        </div>
      </div>

      {/* Assignment Details Modal */}
      {viewingAssignment && (
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500 shadow-2xl mb-6">
          <CardHeader className="bg-blue-600/10 border-b border-blue-500/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <FileText className="h-7 w-7 text-blue-400" />
                {viewingAssignment.title}
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setViewingAssignment(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h3 className="text-base font-semibold text-blue-400 mb-2">Description</h3>
              <p className="text-white text-base whitespace-pre-wrap leading-relaxed">
                {viewingAssignment.description || 'No description provided'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-base font-semibold text-blue-400 mb-2">Due Date</h3>
                <p className="text-white text-lg font-medium flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  {new Date(viewingAssignment.dueDate).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-base font-semibold text-blue-400 mb-2">Total Points</h3>
                <p className="text-white text-2xl font-bold">{viewingAssignment.totalMarks || viewingAssignment.totalPoints}</p>
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h3 className="text-base font-semibold text-blue-400 mb-2">Submissions</h3>
              <p className="text-white text-xl font-semibold">{viewingAssignment.submissions?.length || 0} submissions</p>
            </div>
            {viewingAssignment.attachments && viewingAssignment.attachments.length > 0 && (
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-base font-semibold text-blue-400 mb-2">Attachments</h3>
                <div className="space-y-2">
                  {viewingAssignment.attachments.map((attachment: string, index: number) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-base font-medium block underline"
                    >
                      📎 Attachment {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="students" className="w-full">
        <TabsList>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Assignments ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Announcements ({announcements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-xl">Enrolled Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 border-2 border-gray-700 rounded-lg hover:bg-gray-750 hover:border-blue-500 transition-all bg-gray-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {student.firstName?.[0]}{student.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-base text-gray-300">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400 font-medium">Student ID</p>
                      <p className="font-bold text-white text-lg">{student.academicInfo?.studentId || 'N/A'}</p>
                    </div>
                  </div>
                ))}
                {students.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-300 text-lg">No students enrolled yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl">Assignments</CardTitle>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  onClick={() => window.location.href = `/instructor/assignments?courseId=${courseId}`}
                >
                  Create Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="p-4 border-2 border-gray-700 rounded-lg hover:bg-gray-750 hover:border-blue-500 transition-all bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white text-lg">{assignment.title}</h3>
                        <p className="text-base text-gray-300 mt-2">{assignment.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-base text-gray-300 font-medium">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-400" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          <span className="text-blue-400">{assignment.totalPoints} points</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setViewingAssignment(assignment)}
                        className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-300 text-lg">No assignments created yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="mt-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl">Announcements</CardTitle>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  onClick={() => window.location.href = `/instructor/announcements/create?courseId=${courseId}`}
                >
                  Create Announcement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="p-4 border-2 border-gray-700 rounded-lg hover:bg-gray-750 hover:border-blue-500 transition-all bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-lg">{announcement.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            announcement.priority === 'high'
                              ? 'bg-red-600 text-white'
                              : announcement.priority === 'medium'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}>
                            {announcement.priority}
                          </span>
                        </div>
                        <p className="text-base text-gray-300 mt-2 leading-relaxed">{announcement.content}</p>
                        <p className="text-sm text-gray-400 mt-3 font-medium">
                          {new Date(announcement.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-300 text-lg">No announcements posted yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
