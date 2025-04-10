
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { PlusCircle, User, Edit, Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  name: string;
  school: string;
  grade: string;
  parentEmail?: string;
  parent_id?: string;
}

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    school: '',
    grade: '',
    parentEmail: ''
  });
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [parentProfiles, setParentProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Fetch students directly from Supabase
      const { data, error } = await supabase
        .from('students')
        .select('*');

      if (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
        return;
      }
      
      // Fetch parent emails for each student
      const parentIds = data.map(s => s.parent_id).filter(Boolean);
      const parentEmailMap: Record<string, string> = {};
      
      if (parentIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', parentIds);
          
        if (!profilesError && profiles) {
          profiles.forEach(profile => {
            parentEmailMap[profile.id] = profile.email;
          });
          setParentProfiles(parentEmailMap);
        }
      }
      
      // Transform data to match Student interface
      const formattedStudents: Student[] = data.map(student => ({
        id: student.id,
        name: student.name,
        school: student.school,
        grade: student.grade,
        parent_id: student.parent_id,
        parentEmail: student.parent_id ? parentEmailMap[student.parent_id] : ''
      }));
      
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentStudent) {
      setCurrentStudent({ ...currentStudent, [name]: value });
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudent.name || !newStudent.school || !newStudent.grade || !newStudent.parentEmail) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      // First check if parent exists with the given email
      const { data: existingParent, error: parentError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newStudent.parentEmail)
        .single();
        
      let parentId = null;
      
      if (parentError && parentError.code === 'PGRST116') {
        // Parent doesn't exist, create a temporary account
        const randomPassword = Math.random().toString(36).slice(-8);
        
        // Register new user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newStudent.parentEmail,
          password: randomPassword,
          options: {
            data: {
              name: `Parent of ${newStudent.name}`,
              role: 'parent'
            }
          }
        });
        
        if (authError) {
          throw authError;
        }
        
        parentId = authData.user?.id;
        
        // Note: A trigger will create the profile row
        
        toast.info(`Parent account created with email: ${newStudent.parentEmail}. Temporary password: ${randomPassword}`);
      } else if (parentError) {
        throw parentError;
      } else {
        parentId = existingParent.id;
      }
      
      // Create the student with the parent ID
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          name: newStudent.name,
          school: newStudent.school,
          grade: newStudent.grade,
          parent_id: parentId,
          tutor_id: user?.id
        })
        .select()
        .single();
        
      if (studentError) {
        throw studentError;
      }
      
      toast.success('Student added successfully');
      setAddDialogOpen(false);
      setNewStudent({
        name: '',
        school: '',
        grade: '',
        parentEmail: ''
      });
      
      await fetchStudents();
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast.error(error.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentStudent || !currentStudent.name || !currentStudent.school || !currentStudent.grade) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('students')
        .update({
          name: currentStudent.name,
          school: currentStudent.school,
          grade: currentStudent.grade
        })
        .eq('id', currentStudent.id);
        
      if (error) {
        throw error;
      }
      
      toast.success('Student updated successfully');
      setEditDialogOpen(false);
      setCurrentStudent(null);
      await fetchStudents();
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast.error(error.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!currentStudent) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', currentStudent.id);
        
      if (error) {
        throw error;
      }
      
      toast.success('Student deleted successfully');
      setDeleteDialogOpen(false);
      setCurrentStudent(null);
      await fetchStudents();
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast.error(error.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (student: Student) => {
    setCurrentStudent(student);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setCurrentStudent(student);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tutor-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-tutor-primary hover:bg-blue-600">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Add a new student to your tuition program.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Student Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newStudent.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    name="school"
                    value={newStudent.school}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grade">Grade/Class</Label>
                  <Input
                    id="grade"
                    name="grade"
                    value={newStudent.grade}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parentEmail">Parent Email</Label>
                  <Input
                    id="parentEmail"
                    name="parentEmail"
                    type="email"
                    value={newStudent.parentEmail}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-tutor-primary hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">○</span>
                      Adding...
                    </>
                  ) : 'Add Student'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Students Yet</CardTitle>
            <CardDescription>
              Start by adding your first student to your tuition program.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button 
              onClick={() => setAddDialogOpen(true)}
              className="bg-tutor-primary hover:bg-blue-600"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Student
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Students</CardTitle>
            <CardDescription>
              Manage your students and their progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Parent Email</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-tutor-primary" />
                        {student.name}
                      </div>
                    </TableCell>
                    <TableCell>{student.school}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell className="text-blue-500">
                      {student.parentEmail || (student.parent_id && parentProfiles[student.parent_id]) || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(student)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Student</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => openDeleteDialog(student)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Student</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information.
            </DialogDescription>
          </DialogHeader>
          {currentStudent && (
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Student Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={currentStudent.name}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-school">School</Label>
                  <Input
                    id="edit-school"
                    name="school"
                    value={currentStudent.school}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-grade">Grade/Class</Label>
                  <Input
                    id="edit-grade"
                    name="grade"
                    value={currentStudent.grade}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-parentEmail">Parent Email</Label>
                  <Input
                    id="edit-parentEmail"
                    name="parentEmail"
                    type="email"
                    value={currentStudent.parentEmail || (currentStudent.parent_id && parentProfiles[currentStudent.parent_id]) || ''}
                    disabled
                  />
                  <p className="text-xs text-gray-500">Parent email cannot be changed</p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  className="bg-tutor-primary hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">○</span>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Student Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              onClick={handleDeleteStudent}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">○</span>
                  Deleting...
                </>
              ) : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
