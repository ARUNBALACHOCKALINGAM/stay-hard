import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebaseConfig";
import { Check } from "lucide-react";
import type { User } from "../types/user";
import { useState } from "react";
import { API_URL } from "../utils/config";


// Login Component
export const LoginPage: React.FC<{
  onLogin: (user: User) => void;
}> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google sign-in successful:", user.photoURL);

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
          currentChallengeId: undefined,
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
            currentChallengeId: undefined,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-2">
              STAY <span className="underline decoration-amber-600 decoration-4 underline-offset-4">HARD</span>
            </h1>
            <p className="text-gray-600 mt-4">
              Mental Toughness Challenge Tracker
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-600 p-4 mb-8 rounded">
            <p className="text-gray-700 italic text-sm">
              The only person who can stop you is you. Get after it.
            </p>
            <p className="text-gray-500 text-xs mt-2 text-right">- David Goggins</p>
          </div>

  <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Please sign in to track your progress.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">What you will get:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Track your 75 Hard or Soft challenge</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Daily task management and progress tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Visual progress overview</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Upload and track progress photos</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};


