import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { PlusCircle, User } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  school: string;
  grade: string;
  parentEmail: string;
}

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
    name: '',
    school: '',
    grade: '',
    parentEmail: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setNewStudent({ name: '', school: '', grade: '', parentEmail: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, school, grade, parentEmail } = newStudent;
    if (!name || !school || !grade || !parentEmail) {
      return toast.error('All fields are required');
    }

    try {
      await apiClient.addStudent(newStudent);
      toast.success('Student added');
      resetForm();
      setDialogOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Add error:', error);
      toast.error('Failed to add student');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-tutor-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Students</h2>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                Fill out student details to enroll them.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {['name', 'school', 'grade', 'parentEmail'].map((field, i) => (
                  <div className="grid gap-2" key={i}>
                    <Label htmlFor={field}>{field === 'parentEmail' ? 'Parent Email' : capitalize(field)}</Label>
                    <Input
                      id={field}
                      name={field}
                      type={field === 'parentEmail' ? 'email' : 'text'}
                      value={(newStudent as any)[field]}
                      onChange={handleInputChange}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-tutor-primary hover:bg-blue-600">
                  Add Student
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
            <CardDescription>Start by adding your first student.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button onClick={() => setDialogOpen(true)} className="bg-tutor-primary hover:bg-blue-600">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add First Student
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>View and manage your students.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Parent Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-tutor-primary" />
                        {student.name}
                      </div>
                    </TableCell>
                    <TableCell>{student.school}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell className="text-blue-500">{student.parentEmail}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1');

export default Students;
