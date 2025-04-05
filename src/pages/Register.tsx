
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Register = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await registerUser(data);
      toast.success('Check your email to verify your account');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      // Toast is handled in the registration function
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register('name', { 
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Please enter a valid email'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>I am a</Label>
                <RadioGroup defaultValue="tutor" {...register('role', { required: 'Role is required' })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tutor" id="tutor" />
                    <Label htmlFor="tutor" className="cursor-pointer">Tutor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="parent" id="parent" />
                    <Label htmlFor="parent" className="cursor-pointer">Parent</Label>
                  </div>
                </RadioGroup>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role.message as string}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full bg-tutor-primary hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">○</span>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="text-center w-full">
              <span className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-tutor-primary hover:text-blue-600 font-medium">
                  Sign in
                </Link>
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
