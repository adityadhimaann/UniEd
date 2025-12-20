import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ExternalLink,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { instructorService } from '@/services/instructorService';

interface Video {
  _id?: string;
  title: string;
  url: string;
  description?: string;
  duration?: string;
  order?: number;
  isPublic?: boolean;
}

interface Material {
  _id?: string;
  title: string;
  type: 'pdf' | 'doc' | 'ppt' | 'link' | 'other';
  url: string;
  description?: string;
  size?: string;
}

interface CourseContentManagementProps {
  courseId: string;
  courseName: string;
}

export function CourseContentManagement({ courseId, courseName }: CourseContentManagementProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form states
  const [videoForm, setVideoForm] = useState<Video>({
    title: '',
    url: '',
    description: '',
    duration: '',
    order: 0,
    isPublic: false,
  });

  const [materialForm, setMaterialForm] = useState<Material>({
    title: '',
    type: 'pdf',
    url: '',
    description: '',
    size: '',
  });

  const [newOutcome, setNewOutcome] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');

  useEffect(() => {
    fetchContent();
  }, [courseId]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getCourseContent(courseId);
      if (response.success) {
        setVideos(response.data.videos || []);
        setMaterials(response.data.materials || []);
        setLearningOutcomes(response.data.learningOutcomes || []);
        setPrerequisites(response.data.prerequisites || []);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  // Video handlers
  const handleAddVideo = () => {
    setEditingVideo(null);
    setVideoForm({
      title: '',
      url: '',
      description: '',
      duration: '',
      order: videos.length + 1,
      isPublic: false,
    });
    setShowVideoDialog(true);
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setVideoForm(video);
    setShowVideoDialog(true);
  };

  const handleSaveVideo = async () => {
    try {
      if (!videoForm.title || !videoForm.url) {
        toast.error('Title and URL are required');
        return;
      }

      if (editingVideo?._id) {
        await instructorService.updateCourseVideo(courseId, editingVideo._id, videoForm);
        toast.success('Video updated successfully');
      } else {
        await instructorService.addCourseVideo(courseId, videoForm);
        toast.success('Video added successfully');
      }

      setShowVideoDialog(false);
      fetchContent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save video');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await instructorService.deleteCourseVideo(courseId, videoId);
      toast.success('Video deleted successfully');
      fetchContent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete video');
    }
  };

  // Material handlers
  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialForm({
      title: '',
      type: 'pdf',
      url: '',
      description: '',
      size: '',
    });
    setShowMaterialDialog(true);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setMaterialForm(material);
    setShowMaterialDialog(true);
  };

  const handleSaveMaterial = async () => {
    try {
      if (!materialForm.title || !materialForm.url) {
        toast.error('Title and URL are required');
        return;
      }

      if (editingMaterial?._id) {
        await instructorService.updateCourseMaterial(courseId, editingMaterial._id, materialForm);
        toast.success('Material updated successfully');
      } else {
        await instructorService.addCourseMaterial(courseId, materialForm);
        toast.success('Material added successfully');
      }

      setShowMaterialDialog(false);
      fetchContent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save material');
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      await instructorService.deleteCourseMaterial(courseId, materialId);
      toast.success('Material deleted successfully');
      fetchContent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete material');
    }
  };

  // Learning outcomes handlers
  const handleAddOutcome = async () => {
    if (!newOutcome.trim()) return;

    try {
      const updated = [...learningOutcomes, newOutcome.trim()];
      await instructorService.updateLearningOutcomes(courseId, updated);
      setLearningOutcomes(updated);
      setNewOutcome('');
      toast.success('Learning outcome added');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add learning outcome');
    }
  };

  const handleDeleteOutcome = async (index: number) => {
    try {
      const updated = learningOutcomes.filter((_, i) => i !== index);
      await instructorService.updateLearningOutcomes(courseId, updated);
      setLearningOutcomes(updated);
      toast.success('Learning outcome removed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove learning outcome');
    }
  };

  // Prerequisites handlers
  const handleAddPrerequisite = async () => {
    if (!newPrerequisite.trim()) return;

    try {
      const updated = [...prerequisites, newPrerequisite.trim()];
      await instructorService.updatePrerequisites(courseId, updated);
      setPrerequisites(updated);
      setNewPrerequisite('');
      toast.success('Prerequisite added');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add prerequisite');
    }
  };

  const handleDeletePrerequisite = async (index: number) => {
    try {
      const updated = prerequisites.filter((_, i) => i !== index);
      await instructorService.updatePrerequisites(courseId, updated);
      setPrerequisites(updated);
      toast.success('Prerequisite removed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove prerequisite');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <img src="/loadicon.gif" alt="Loading" className="h-16 w-16" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Course Content Management</h2>
        <p className="text-muted-foreground">{courseName}</p>
      </div>

      {/* Videos Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Course Videos ({videos.length})
            </CardTitle>
            <Button onClick={handleAddVideo} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Video
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No videos added yet. Click "Add Video" to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {videos.sort((a, b) => (a.order || 0) - (b.order || 0)).map((video) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{video.title}</h4>
                    {video.description && (
                      <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {video.duration && <span>Duration: {video.duration}</span>}
                      <span>Order: {video.order}</span>
                      {video.isPublic && <Badge variant="secondary">Public</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(video.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditVideo(video)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteVideo(video._id!)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Course Materials ({materials.length})
            </CardTitle>
            <Button onClick={handleAddMaterial} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Material
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No materials added yet. Click "Add Material" to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <motion.div
                  key={material._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{material.title}</h4>
                    {material.description && (
                      <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="uppercase">{material.type}</Badge>
                      {material.size && <span>{material.size}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(material.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditMaterial(material)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteMaterial(material._id!)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Outcomes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Learning Outcomes ({learningOutcomes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a learning outcome..."
              value={newOutcome}
              onChange={(e) => setNewOutcome(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddOutcome()}
            />
            <Button onClick={handleAddOutcome} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {learningOutcomes.length > 0 && (
            <ul className="space-y-2">
              {learningOutcomes.map((outcome, index) => (
                <li key={index} className="flex items-start gap-2 p-2 border rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="flex-1 text-sm">{outcome}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteOutcome(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Prerequisites Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Prerequisites ({prerequisites.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a prerequisite..."
              value={newPrerequisite}
              onChange={(e) => setNewPrerequisite(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPrerequisite()}
            />
            <Button onClick={handleAddPrerequisite} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {prerequisites.length > 0 && (
            <ul className="space-y-2">
              {prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-start gap-2 p-2 border rounded-lg">
                  <BookOpen className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span className="flex-1 text-sm">{prereq}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeletePrerequisite(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingVideo ? 'Edit Video' : 'Add Video'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                placeholder="e.g., Introduction to React Hooks"
                value={videoForm.title}
                onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Video URL *</label>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoForm.url}
                onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Brief description of the video content..."
                value={videoForm.description}
                onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <Input
                  placeholder="e.g., 15:30"
                  value={videoForm.duration}
                  onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Order</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={videoForm.order}
                  onChange={(e) => setVideoForm({ ...videoForm, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSaveVideo}>
                <Save className="w-4 h-4 mr-1" />
                Save Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Material Dialog */}
      <Dialog open={showMaterialDialog} onOpenChange={setShowMaterialDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? 'Edit Material' : 'Add Material'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                placeholder="e.g., React Documentation"
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type *</label>
              <Select
                value={materialForm.type}
                onValueChange={(value: any) => setMaterialForm({ ...materialForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Document</SelectItem>
                  <SelectItem value="ppt">Presentation</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">URL *</label>
              <Input
                placeholder="https://..."
                value={materialForm.url}
                onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Brief description of the material..."
                value={materialForm.description}
                onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">File Size</label>
              <Input
                placeholder="e.g., 2.5 MB"
                value={materialForm.size}
                onChange={(e) => setMaterialForm({ ...materialForm, size: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setShowMaterialDialog(false)}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSaveMaterial}>
                <Save className="w-4 h-4 mr-1" />
                Save Material
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
