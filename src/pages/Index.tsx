
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { isAuthenticated } from '../api/client';

const Index = () => {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-gradient-to-b from-white to-gray-100">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
          TutorParentConnect
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          Comprehensive Tuition Management & Student Progress Tracker
        </p>
        <div className="flex gap-4">
          {isLoggedIn ? (
            <Button 
              className="bg-tutor-primary hover:bg-blue-600 text-white px-8 py-2 rounded-md text-lg"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button 
                className="bg-tutor-primary hover:bg-blue-600 text-white px-8 py-2 rounded-md text-lg"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                variant="outline"
                className="border-tutor-primary text-tutor-primary hover:bg-blue-50 px-8 py-2 rounded-md text-lg"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-tutor-primary h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Student Management</h3>
              <p className="text-gray-600">Track student progress, attendance, and performance in one place.</p>
            </div>
            <div className="text-center">
              <div className="bg-tutor-secondary h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Homework & Exams</h3>
              <p className="text-gray-600">Keep track of homework assignments and upcoming exams.</p>
            </div>
            <div className="text-center">
              <div className="bg-tutor-accent h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Parent Communication</h3>
              <p className="text-gray-600">Seamless communication between tutors and parents.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 text-center">
        <p>© {new Date().getFullYear()} TutorParentConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
