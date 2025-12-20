import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { instructorService } from '@/services/instructorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Users, BookOpen, UserPlus, Check, X, Clock, Upload, Image as ImageIcon, Video } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function CoursesManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    credits: 3,
    semester: 1,
    department: '',
    titleImage: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchCourses();
    fetchEnrollmentRequests();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getMyCourses();
      console.log('Instructor courses response:', response);
      // API returns { success, data, message } - data contains the courses array
      const coursesData = response?.data || response || [];
      console.log('Instructor courses data:', coursesData);
      console.log('First course titleImage:', coursesData[0]?.titleImage);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentRequests = async () => {
    try {
      const response = await instructorService.getEnrollmentRequests('pending');
      const requestsData = response?.data || response || [];
      setEnrollmentRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error('Error fetching enrollment requests:', error);
      setEnrollmentRequests([]);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      console.log('Approving request:', requestId);
      const response = await instructorService.respondToEnrollmentRequest(requestId, 'approved');
      console.log('Approve response:', response);
      
      // Check if response indicates success
      if (response?.success || response?.data?.success || response?.status === 200) {
        await fetchEnrollmentRequests();
        alert('✅ Enrollment request approved successfully! The student has been notified.');
      } else {
        throw new Error(response?.message || response?.data?.message || 'Approval failed');
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error approving request';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const responseMessage = prompt('Enter rejection reason (optional):');
    if (responseMessage === null) return; // User cancelled
    
    try {
      console.log('Rejecting request:', requestId);
      const response = await instructorService.respondToEnrollmentRequest(requestId, 'rejected', responseMessage || undefined);
      console.log('Reject response:', response);
      
      // Check if response indicates success
      if (response?.success || response?.data?.success || response?.status === 200) {
        await fetchEnrollmentRequests();
        alert('✅ Enrollment request rejected. The student has been notified.');
      } else {
        throw new Error(response?.message || response?.data?.message || 'Rejection failed');
      }
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error rejecting request';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, titleImage: '' });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // If there's an image, upload it first
      let imageUrl = formData.titleImage;
      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', imageFile);
        
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
          alert('Authentication token not found. Please login again.');
          window.location.href = '/login';
          return;
        }
        
        // Upload image to server
        const uploadResponse = await fetch(`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataUpload,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          console.log('Upload response:', uploadData);
          imageUrl = uploadData.data.url;
          console.log('Image URL to save:', imageUrl);
        } else {
          const errorText = await uploadResponse.text();
          console.error('Upload failed:', errorText);
          
          // Check if it's an auth error
          if (uploadResponse.status === 401) {
            alert('⚠️ Your session has expired. Please logout and login again to upload images.');
            return;
          }
          
          alert(`Image upload failed: ${errorText}`);
          return;
        }
      }

      console.log('Creating course with data:', { ...formData, titleImage: imageUrl });
      await instructorService.createCourse({
        ...formData,
        titleImage: imageUrl,
      });
      setShowCreateForm(false);
      setFormData({ code: '', name: '', description: '', credits: 3, semester: 1, department: '', titleImage: '' });
      setImageFile(null);
      setImagePreview('');
      fetchCourses();
      alert('Course created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating course');
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setFormData({
      code: course.courseCode,
      name: course.courseName,
      description: course.description || '',
      credits: course.credits,
      semester: course.semester,
      department: course.department || '',
      titleImage: course.titleImage || '',
    });
    setImagePreview(course.titleImage || '');
    setImageFile(null);
    setShowCreateForm(false);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      // If there's a new image, upload it first
      let imageUrl = formData.titleImage;
      
      console.log('=== UPDATE COURSE DEBUG ===');
      console.log('Has new image file?', !!imageFile);
      console.log('Current titleImage:', formData.titleImage);
      
      if (imageFile) {
        console.log('Uploading new image...');
        const formDataUpload = new FormData();
        formDataUpload.append('file', imageFile);
        
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        console.log('Token exists?', !!token);
        console.log('Token from:', localStorage.getItem('accessToken') ? 'accessToken' : 'token');
        
        if (!token) {
          alert('Authentication token not found. Please login again.');
          window.location.href = '/login';
          return;
        }
        
        const uploadResponse = await fetch(`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataUpload,
        });
        
        console.log('Upload response status:', uploadResponse.status);
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          console.log('Upload response data:', uploadData);
          imageUrl = uploadData.data.url;
          console.log('New image URL:', imageUrl);
        } else {
          const errorText = await uploadResponse.text();
          console.error('Upload failed:', errorText);
          
          // Check if it's an auth error
          if (uploadResponse.status === 401) {
            alert('⚠️ Your session has expired. Please logout and login again to upload images.');
            return;
          }
          
          alert(`Image upload failed: ${errorText}`);
          return; // Don't proceed if upload fails
        }
      } else {
        console.log('No new image file, keeping existing:', imageUrl);
      }

      const updateData = {
        name: formData.name,
        description: formData.description,
        credits: formData.credits,
        semester: formData.semester,
        department: formData.department,
        titleImage: imageUrl,
      };
      
      console.log('Updating course with data:', updateData);
      
      const response = await instructorService.updateCourse(editingCourse._id, updateData);
      console.log('Update response:', response);
      
      setEditingCourse(null);
      setFormData({ code: '', name: '', description: '', credits: 3, semester: 1, department: '', titleImage: '' });
      setImageFile(null);
      setImagePreview('');
      
      await fetchCourses();
      alert('✅ Course updated successfully with image!');
    } catch (error: any) {
      console.error('Update error:', error);
      alert(error.response?.data?.message || error.message || 'Error updating course');
    }
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setFormData({ code: '', name: '', description: '', credits: 3, semester: 1, department: '', titleImage: '' });
    setImageFile(null);
    setImagePreview('');
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await instructorService.deleteCourse(courseId);
      fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting course');
    }
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      course.courseCode?.toLowerCase().includes(query) ||
      course.courseName?.toLowerCase().includes(query) ||
      course.department?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <img src="/loadicon.gif" alt="Loading..." className="h-48 w-48" />
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">My Courses</h1>
          <p className="text-gray-400 mt-0.5 text-sm">Manage your courses</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </motion.div>

      {/* Search Input */}
      {!showCreateForm && !editingCourse && (
        <motion.div variants={itemVariants}>
          <Input
            placeholder="Search courses by code, name, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </motion.div>
      )}

      {/* Edit Course Form */}
      {editingCourse && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-white">Edit Course</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCourse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      disabled
                      className="bg-gray-700 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400">Course code cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Course Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Introduction to Programming"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Course description..."
                    required
                    rows={3}
                  />
                </div>
                
                {/* Image Upload Section for Edit */}
                <div className="space-y-2">
                  <Label htmlFor="editTitleImage">Course Title Image</Label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-900">
                          <img 
                            src={imagePreview} 
                            alt="Course preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-400 text-center">
                          {imageFile ? `${imageFile.name} (${(imageFile.size / 1024).toFixed(2)} KB)` : 'Current image'}
                        </p>
                      </div>
                    ) : (
                      <label 
                        htmlFor="editTitleImage" 
                        className="flex flex-col items-center justify-center cursor-pointer py-8"
                      >
                        <Upload className="h-12 w-12 text-gray-500 mb-3" />
                        <p className="text-sm font-medium text-gray-300 mb-1">
                          Click to upload course image
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                        <input
                          id="editTitleImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits *</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                      min="1"
                      max="6"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester (1-12) *</Label>
                    <Input
                      id="semester"
                      type="number"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                      min="1"
                      max="12"
                      placeholder="1"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Computer Science"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Update Course
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Create Course Form */}
      {showCreateForm && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Create New Course</CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CS101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Introduction to Programming"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course description..."
                  required
                  rows={3}
                />
              </div>
              
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label htmlFor="titleImage">Course Title Image</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-900">
                        <img 
                          src={imagePreview} 
                          alt="Course preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-400 text-center">
                        {imageFile?.name} ({(imageFile!.size / 1024).toFixed(2)} KB)
                      </p>
                    </div>
                  ) : (
                    <label 
                      htmlFor="titleImage" 
                      className="flex flex-col items-center justify-center cursor-pointer py-8"
                    >
                      <Upload className="h-12 w-12 text-gray-500 mb-3" />
                      <p className="text-sm font-medium text-gray-300 mb-1">
                        Click to upload course image
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                      <input
                        id="titleImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits *</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    min="1"
                    max="6"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester (1-12) *</Label>
                  <Input
                    id="semester"
                    type="number"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    min="1"
                    max="12"
                    placeholder="1"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Computer Science"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Create Course
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </motion.div>
      )}

      {/* Pending Enrollment Requests */}
      {enrollmentRequests.length > 0 && (
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-orange-600" />
                  <CardTitle className="text-white text-lg">Pending Enrollment Requests</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-orange-900 text-orange-300 text-xs">
                  {enrollmentRequests.length} pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {enrollmentRequests.map((request: any, index: number) => (
                  <motion.div 
                    key={request._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900 rounded-lg p-3 flex items-center justify-between gap-3 hover:bg-gray-850 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {request.student?.avatar ? (
                        <img 
                          src={request.student.avatar} 
                          alt={request.student?.firstName} 
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                          {request.student?.firstName?.[0]}{request.student?.lastName?.[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-white text-sm">
                            {request.student?.firstName} {request.student?.lastName}
                          </h4>
                          <span className="text-[10px] text-gray-400 truncate">{request.student?.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-300">{request.course?.name || request.course?.courseName}</span>
                          <span className="text-[10px] text-gray-500">•</span>
                          <span className="text-[10px] text-blue-400">{request.course?.code || request.course?.courseCode}</span>
                          <span className="text-[10px] text-gray-500">•</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-900 text-purple-300">
                            {request.enrollmentType}
                          </span>
                        </div>
                        {request.message && (
                          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{request.message}</p>
                        )}
                        <div className="flex items-center gap-0.5 text-[10px] text-gray-500 mt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(request.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request._id)}
                          className="bg-green-600 hover:bg-green-700 h-7 text-xs px-2"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request._id)}
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white h-7 text-xs px-2"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Courses List */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
      >
        {filteredCourses.map((course) => (
          <motion.div key={course._id} variants={itemVariants}>
            <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow overflow-hidden">
              {/* Course Image */}
              {course.titleImage ? (
                <div className="w-full h-32 overflow-hidden bg-gray-900">
                  <img 
                    src={course.titleImage} 
                    alt={course.courseName}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image failed to load:', course.titleImage);
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center"><svg class="h-16 w-16 text-blue-300 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></div>';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-blue-300 opacity-50" />
                </div>
              )}
              
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-600">{course.courseCode}</span>
                    </div>
                    <CardTitle className="mt-1 text-white text-base">{course.courseName}</CardTitle>
                  </div>
                  <div className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                    course.isActive
                      ? 'bg-green-900 text-green-300'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{course.credits} Credits</span>
                <span>{course.semester}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => window.location.href = `/instructor/courses/${course._id}`}
                >
                  <Users className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => window.location.href = `/instructor/courses/${course._id}/content`}
                >
                  <Video className="h-3 w-3 mr-1" />
                  Content
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEditCourse(course)}
                >
                  <Edit2 className="h-3 w-3 text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDeleteCourse(course._id)}
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredCourses.length === 0 && !showCreateForm && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? 'No courses found' : 'No courses yet'}
              </h3>
              <p className="text-gray-400 mb-4">
                {searchQuery 
                  ? `No courses match "${searchQuery}"`
                  : 'Get started by creating your first course'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
