
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      if (isLogin) {
        // Use AuthContext to perform login and update auth state
        await login(normalizedEmail, normalizedPassword);
        toast.success('Successfully logged in!');
        // Redirect to intended route or home
        const state = (navigate as any).location?.state as { from?: Location } | undefined;
        const fromPath = state?.from?.pathname || '/';
        navigate(fromPath, { replace: true });
      } else {
        // Register, then sign in via context, then redirect home
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        await login(normalizedEmail, normalizedPassword);
        toast.success('Account created! You are now logged in.');
        navigate('/', { replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      // Ensure we stay on login page after failed login (don't show blank screen)
      navigate('/login', { replace: true });
    }
  };

  // Password reset not implemented for custom backend
  const handleForgotPassword = async () => {
    toast.error('Password reset is not implemented. Please contact support.');
  };
  
  return (
    <div className="section-container min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-serif font-medium text-center text-sawatsya-wood mb-6">
            {isLogin ? 'Login to Your Account' : 'Create an Account'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth"
              />
            </div>
            
            {isLogin && (
              <div className="text-right">
                <button type="button" onClick={handleForgotPassword} className="text-sm text-sawatsya-earth hover:text-sawatsya-terracotta">
                  Forgot password?
                </button>
              </div>
            )}
            
            <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sawatsya-earth hover:text-sawatsya-terracotta font-medium"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
