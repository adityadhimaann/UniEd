import { useParams } from 'react-router-dom';
import { CourseContentManagement } from '@/components/instructor/CourseContentManagement';
import { useState, useEffect } from 'react';
import { instructorService } from '@/services/instructorService';

export default function CourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseName = async () => {
      try {
        const response = await instructorService.getMyCourses();
        const courses = response?.data || [];
        const course = courses.find((c: any) => c._id === courseId);
        if (course) {
          setCourseName(course.courseName);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseName();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <img src="/loadicon.gif" alt="Loading" className="h-32 w-32" />
      </div>
    );
  }

  if (!courseId) {
    return <div>Course not found</div>;
  }

  return <CourseContentManagement courseId={courseId} courseName={courseName} />;
}
