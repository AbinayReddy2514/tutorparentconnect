
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import apiClient from '../api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  ClipboardList,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface Profile {
  name: string;
  role: string;
}

interface DashboardStats {
  students: number;
  attendance: number;
  homeworks: number;
  exams: number;
  pendingFees: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    students: 0,
    attendance: 0,
    homeworks: 0,
    exams: 0,
    pendingFees: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', user.id)
            .single();
            
          if (data && !error) {
            setProfile(data as Profile);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data
        const students = await apiClient.getStudents();
        const attendance = await apiClient.getAttendance();
        const homework = await apiClient.getHomework();
        const exams = await apiClient.getExams();
        const fees = await apiClient.getFees();
        
        // Calculate stats
        const pendingFees = fees.filter((fee: any) => fee.status === 'pending').length;
        const pendingHomework = homework.filter((hw: any) => hw.status === 'pending').length;
        const upcomingExams = exams.filter((exam: any) => 
          new Date(exam.date) > new Date() && !exam.score
        ).length;
        
        setStats({
          students: students.length,
          attendance: attendance.length,
          homeworks: pendingHomework,
          exams: upcomingExams,
          pendingFees: pendingFees
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const dashboardCards = [
    {
      title: 'Students',
      value: stats.students,
      description: profile?.role === 'tutor' ? 'Total students' : 'Children enrolled',
      icon: <Users className="h-8 w-8 text-tutor-primary" />,
      onClick: () => navigate('/students')
    },
    {
      title: 'Homework',
      value: stats.homeworks,
      description: 'Pending tasks',
      icon: <BookOpen className="h-8 w-8 text-tutor-secondary" />,
      onClick: () => navigate('/homework')
    },
    {
      title: 'Exams',
      value: stats.exams,
      description: 'Upcoming exams',
      icon: <ClipboardList className="h-8 w-8 text-tutor-accent" />,
      onClick: () => navigate('/exams')
    },
    {
      title: 'Attendance',
      value: stats.attendance,
      description: 'Total sessions',
      icon: <Calendar className="h-8 w-8 text-tutor-primary" />,
      onClick: () => navigate('/attendance')
    },
    {
      title: 'Fees',
      value: stats.pendingFees,
      description: 'Pending payments',
      icon: <DollarSign className="h-8 w-8 text-red-500" />,
      onClick: () => navigate('/fees')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tutor-primary mx-auto"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.name || 'User'}!</h2>
        <p className="text-muted-foreground">
          Here's an overview of {profile?.role === 'tutor' ? 'your students' : 'your child\'s'} progress
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((card) => (
          <Card 
            key={card.title} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={card.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {profile?.role === 'tutor' && (
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>
              Important notifications that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.pendingFees > 0 ? (
              <div className="flex items-center space-x-2 text-amber-500">
                <AlertTriangle />
                <span>
                  You have {stats.pendingFees} student{stats.pendingFees > 1 ? 's' : ''} with pending fees
                </span>
              </div>
            ) : (
              <div className="text-green-500">No urgent alerts at the moment</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
