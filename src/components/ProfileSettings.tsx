// src/components/ProfileSettings.tsx
import { useState } from 'react';
import { User, Mail, Lock, Award, Flame, Calendar, TrendingUp, X } from 'lucide-react';
import type { User as UserType } from '../types/user';
import { useUserStats } from '../hooks/useUserStats';

interface ProfileSettingsProps {
  user: UserType;
  onClose: () => void;
  onUpdateEmail?: (email: string) => Promise<void>;
  onUpdatePassword?: (password: string) => Promise<void>;
}

export function ProfileSettings({ user, onClose, onUpdateEmail, onUpdatePassword }: ProfileSettingsProps) {
  const [email, setEmail] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const isGoogleUser = user.provider === 'google';
  
  // Fetch user stats
  const { stats, isLoading: isLoadingStats } = useUserStats(user);

  // Check if user has valid ID
  const hasValidUserId = user._id && user._id !== '';

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (email === user.email) {
      setEmailError('This is your current email address');
      return;
    }

    setIsUpdatingEmail(true);
    try {
      if (onUpdateEmail) {
        await onUpdateEmail(email);
        setEmailSuccess('Email updated successfully!');
      }
    } catch (error: any) {
      setEmailError(error.message || 'Failed to update email');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (onUpdatePassword) {
        await onUpdatePassword(newPassword);
        setPasswordSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              <p className="text-amber-100 text-sm">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Achievements Section */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-amber-500" />
              Your Achievements
            </h3>
            
            {isLoadingStats ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.longestStreak}</p>
                <p className="text-sm text-gray-600">Longest Streak</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
                <p className="text-sm text-gray-600">Current Streak</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalChallengesCompleted}</p>
                <p className="text-sm text-gray-600">Challenges Done</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTasksCompleted}</p>
                <p className="text-sm text-gray-600">Tasks Completed</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Member since:</span> {stats.memberSince}
              </p>
            </div>
              </>
            )}
          </section>

          {/* Account Settings */}
          {!hasValidUserId ? (
            <section className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lock className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Account Setup Required</h4>
                  <p className="text-sm text-gray-600">
                    Your account needs to be properly registered. Please log out and log back in to complete setup.
                  </p>
                </div>
              </div>
            </section>
          ) : !isGoogleUser && (
            <>
              {/* Email Update */}
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-6 h-6 mr-2 text-amber-500" />
                  Update Email
                </h3>
                <form onSubmit={handleEmailUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {emailError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{emailError}</p>
                    </div>
                  )}

                  {emailSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600">{emailSuccess}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUpdatingEmail}
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingEmail ? 'Updating...' : 'Update Email'}
                  </button>
                </form>
              </section>

              {/* Password Update */}
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-2 text-amber-500" />
                  Change Password
                </h3>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{passwordError}</p>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600">{passwordSuccess}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </section>
            </>
          )}

          {isGoogleUser && (
            <section className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Mail className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Google Account</h4>
                  <p className="text-sm text-gray-600">
                    You're signed in with Google. Email and password changes must be done through your Google account settings.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
