import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function InstructorProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    bio: '',
    officeLocation: '',
    officeHours: '',
    specialization: '',
    joinedDate: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/instructor/profile');
      const data = response.data.data || response.data;
      setProfile({
        firstName: data.profile?.firstName || data.firstName || '',
        lastName: data.profile?.lastName || data.lastName || '',
        email: data.email || '',
        phone: data.profile?.phone || '',
        department: data.profile?.department || '',
        designation: data.profile?.designation || '',
        bio: data.profile?.bio || '',
        officeLocation: data.profile?.officeLocation || '',
        officeHours: data.profile?.officeHours || '',
        specialization: data.profile?.specialization || '',
        joinedDate: data.createdAt || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/instructor/profile', profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Card */}
        <Card className="border-gray-700 bg-gray-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Profile Picture</CardTitle>
            <CardDescription className="text-gray-400">Update your profile photo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-3xl">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
            <p className="text-xs text-gray-500 text-center">
              JPG, PNG or GIF. Max size 2MB
            </p>
          </CardContent>
        </Card>

        {/* Profile Information Card */}
        <Card className="border-gray-700 bg-gray-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
            <CardDescription className="text-gray-400">Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleChange}
                      className="pl-10 bg-gray-900 border-gray-700 text-white"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleChange}
                      className="pl-10 bg-gray-900 border-gray-700 text-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="pl-10 bg-gray-900 border-gray-700 text-white"
                    placeholder="john.doe@university.edu"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="pl-10 bg-gray-900 border-gray-700 text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-gray-300">Department</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="department"
                      name="department"
                      value={profile.department}
                      onChange={handleChange}
                      className="pl-10 bg-gray-900 border-gray-700 text-white"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-gray-300">Designation</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="designation"
                      name="designation"
                      value={profile.designation}
                      onChange={handleChange}
                      className="pl-10 bg-gray-900 border-gray-700 text-white"
                      placeholder="Associate Professor"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization" className="text-gray-300">Specialization</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleChange}
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="Machine Learning, Data Science"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="officeLocation" className="text-gray-300">Office Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="officeLocation"
                    name="officeLocation"
                    value={profile.officeLocation}
                    onChange={handleChange}
                    className="pl-10 bg-gray-900 border-gray-700 text-white"
                    placeholder="Building A, Room 301"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="officeHours" className="text-gray-300">Office Hours</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="officeHours"
                    name="officeHours"
                    value={profile.officeHours}
                    onChange={handleChange}
                    className="pl-10 bg-gray-900 border-gray-700 text-white"
                    placeholder="Mon-Fri, 2:00 PM - 4:00 PM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
                  placeholder="Tell us about yourself, your research interests, and teaching philosophy..."
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
