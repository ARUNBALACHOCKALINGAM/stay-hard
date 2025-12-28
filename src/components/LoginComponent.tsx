import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebaseConfig";
import { Check } from "lucide-react";
import type { User } from "../types/user";
import { useState } from "react";
import { API_URL } from "../utils/config";
import { authService } from "../services/authService";


// Login Component
export const LoginPage: React.FC<{
  onLogin: (user: User) => void;
}> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');

const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get Firebase ID token and send to backend to verify/create user
      const idToken = await user.getIdToken();

      const resp = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!resp.ok) {
        // If backend verification fails, fall back to basic client user info
        console.warn('Backend token verification failed', resp.status);
        const fallbackUser: User = {
          _id: '',
          name: user.displayName || "User",
          email: user.email || "",
          photoUrl: user.photoURL || "",
          firebaseUid: user.uid || '',
          currentChallengeId: 'undefined',
          emailVerified: !!user.emailVerified,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User;
        onLogin(fallbackUser);
      } else {
        const data = await resp.json();
        // backend returns { user, message }
        const backendUser = data?.user;
        if (backendUser) {
          // Map backend user shape to frontend User type if needed
          const mapped: User = {
            _id: backendUser._id || backendUser.id || '',
            name: backendUser.name || user.displayName || 'User',
            email: backendUser.email || user.email || '',
            photoUrl: backendUser.photoUrl || user.photoURL || '',
            firebaseUid: backendUser.firebaseUid || user.uid || '',
            currentChallengeId: backendUser.currentChallengeId,
            emailVerified: backendUser.emailVerified || false,
            lastLogin: backendUser.lastLogin ? new Date(backendUser.lastLogin) : new Date(),
            createdAt: backendUser.createdAt ? new Date(backendUser.createdAt) : new Date(),
            updatedAt: backendUser.updatedAt ? new Date(backendUser.updatedAt) : new Date(),
          } as User;
          onLogin(mapped);
        } else {
          const fallbackUser: User = {
            _id: '',
            name: user.displayName || "User",
            email: user.email || "",
            photoUrl: user.photoURL || "",
            firebaseUid: user.uid || '',
            currentChallengeId: 'undefined',
            emailVerified: !!user.emailVerified,
            lastLogin: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          } as User;
          onLogin(fallbackUser);
        }
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await authService.signupLocal(formData.name, formData.email, formData.password);
      onLogin(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await authService.signinLocal(formData.email, formData.password);
      onLogin(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error on input change
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-0 md:p-4">
      <div className="w-full h-full md:max-w-lg md:w-full md:h-auto lg:max-w-xl">
        <div className="bg-white rounded-none md:rounded-2xl shadow-none md:shadow-2xl p-3 md:p-6 lg:p-8 min-h-screen md:min-h-0">
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              STAY <span className="underline decoration-amber-600 decoration-4 underline-offset-4 italic">HARD</span>
            </h1>
            <p className="text-gray-600 mt-2 md:mt-4 text-sm md:text-base">
              Mental Toughness Challenge Tracker
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-600 p-2 md:p-3 mb-3 md:mb-4 rounded">
            <p className="text-gray-700 italic text-xs md:text-sm">
              The only person who can stop you is you. Get after it.
            </p>
            <p className="text-gray-500 text-xs mt-1 text-right">- David Goggins</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center border-b border-gray-200 mb-4 md:mb-6">
            <div className="flex">
              <button
                onClick={() => setAuthMode('signin')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  authMode === 'signin'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  authMode === 'signup'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Sign In Section */}
          {authMode === 'signin' && (
            <div className="space-y-3">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-600 rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Email/Password Sign In Form */}
              <form onSubmit={handleLocalSignin} className="space-y-4">
                <div>
                  <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="signin-password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
                    placeholder="Enter your password"
                  />
                </div>
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-600 text-white py-3 md:py-4 px-4 rounded-xl font-semibold hover:bg-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm md:text-base"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </div>
          )}

          {/* Sign Up Form */}
          {authMode === 'signup' && (
            <form onSubmit={handleLocalSignup} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
                  placeholder="Create a password (min 6 characters)"
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 text-white py-3 md:py-4 px-4 rounded-xl font-semibold hover:bg-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm md:text-base"
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              {authMode === 'signin'
                ? 'Welcome back! Please sign in to continue.'
                : 'Create your account to start your challenge journey.'
              }
            </p>
          </div>

          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">What you will get:</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Track your 75 Hard or Soft challenge</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Daily task management and progress tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Visual progress overview</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Upload and track progress photos</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};


