
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Book, 
  Calendar, 
  ClipboardList,
  DollarSign,
  BarChart,
  MessageSquare,
  Settings,
  Home
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          // Get role from user metadata
          const role = user.user_metadata?.role;
          if (role) {
            setUserRole(role);
            return;
          }
          
          // Fallback to profiles table if not in metadata
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (data && !error) {
            setUserRole(data.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    }
    
    fetchProfile();
  }, [user]);
  
  const tutorLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Homework', href: '/homework', icon: Book },
    { name: 'Exams', href: '/exams', icon: ClipboardList },
    { name: 'Attendance', href: '/attendance', icon: Calendar },
    { name: 'Fees', href: '/fees', icon: DollarSign },
    { name: 'Performance', href: '/performance', icon: BarChart },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];
  
  const parentLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Homework', href: '/homework', icon: Book },
    { name: 'Exams', href: '/exams', icon: ClipboardList },
    { name: 'Attendance', href: '/attendance', icon: Calendar },
    { name: 'Fees', href: '/fees', icon: DollarSign },
    { name: 'Performance', href: '/performance', icon: BarChart },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];
  
  const links = userRole === 'tutor' ? tutorLinks : parentLinks;
  
  console.log('User role:', userRole);

  return (
    <div className="bg-white shadow-sm w-64 flex-shrink-0 hidden md:block">
      <div className="p-4 flex items-center justify-center border-b">
        <h1 className="text-2xl font-bold text-tutor-primary">ParentTutor</h1>
      </div>
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {links.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? 'bg-tutor-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                )}
              >
                <Icon
                  className={cn(
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 h-5 w-5'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
