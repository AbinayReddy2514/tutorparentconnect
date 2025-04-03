
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { PlusCircle, BookOpen, Check, Clock } from 'lucide-react';

const Homework = () => {
  const { user } = useAuth();
  const [homeworks, setHomeworks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newHomework, setNewHomework] = useState({
    studentId: '',
    subject: '',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [homeworkData, studentsData] = await Promise.all([
          apiClient.getHomework(),
          apiClient.getStudents()
        ]);
        setHomeworks(homeworkData);
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewHomework(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setNewHomework(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newHomework.studentId || !newHomework.subject || !newHomework.description || !newHomework.dueDate) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      await apiClient.addHomework(newHomework);
      toast.success('Homework added successfully');
      setDialogOpen(false);
      setNewHomework({
        studentId: '',
        subject: '',
        description: '',
        dueDate: ''
      });
      
      // Refresh homework list
      const homeworkData = await apiClient.getHomework();
      setHomeworks(homeworkData);
    } catch (error) {
      console.error('Error adding homework:', error);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.updateHomeworkStatus(id, newStatus);
      toast.success('Homework status updated');
      
      // Update UI
      setHomeworks(prevHomeworks => 
        prevHomeworks.map((hw: any) => 
          hw.id === id ? { ...hw, status: newStatus } : hw
        )
      );
    } catch (error) {
      console.error('Error updating homework status:', error);
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find((s: any) => s.id === studentId);
    return student ? (student as any).name : 'Unknown Student';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tutor-primary"></div>
      </div>
    );
  }

  const isParent = user?.role === 'parent';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Homework</h2>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-tutor-primary hover:bg-blue-600">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Homework
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Homework</DialogTitle>
              <DialogDescription>
                {isParent 
                  ? "Add homework assigned by school for the tutor's reference."
                  : "Add homework for your students to complete."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="studentId">Student</Label>
                  <Select 
                    value={newHomework.studentId} 
                    onValueChange={(value) => handleSelectChange(value, 'studentId')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student: any) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={newHomework.subject}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newHomework.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={newHomework.dueDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-tutor-primary hover:bg-blue-600">
                  Add Homework
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {homeworks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Homework Yet</CardTitle>
            <CardDescription>
              {isParent 
                ? "Start by adding homework assignments from your child's school."
                : "No homework has been assigned yet."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-tutor-primary hover:bg-blue-600"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Homework
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Homework Assignments</CardTitle>
            <CardDescription>
              Track and manage homework assignments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  {!isParent && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {homeworks.map((homework: any) => (
                  <TableRow key={homework.id}>
                    <TableCell className="font-medium">
                      {getStudentName(homework.studentId)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-tutor-primary" />
                        {homework.subject}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {homework.description}
                    </TableCell>
                    <TableCell>{new Date(homework.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={homework.status === 'completed' ? 'default' : 'outline'}
                        className={
                          homework.status === 'completed' 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'text-amber-500'
                        }
                      >
                        {homework.status === 'completed' ? (
                          <><Check className="h-3 w-3 mr-1" /> Completed</>
                        ) : (
                          <><Clock className="h-3 w-3 mr-1" /> Pending</>
                        )}
                      </Badge>
                    </TableCell>
                    {!isParent && (
                      <TableCell>
                        {homework.status === 'pending' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-500 border-green-500 hover:bg-green-50"
                            onClick={() => handleUpdateStatus(homework.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-amber-500 border-amber-500 hover:bg-amber-50"
                            onClick={() => handleUpdateStatus(homework.id, 'pending')}
                          >
                            Mark Pending
                          </Button>
                        )}
                      </TableCell>
                    )}
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

export default Homework;
