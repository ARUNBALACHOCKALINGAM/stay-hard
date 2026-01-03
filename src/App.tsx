// src/App.tsx (Updated File)
import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';


// Types
import type { User } from './types/user'; 

// Components
import { LoginPage } from './components/LoginComponent';
import { Loading } from './components/Loading';
import { SimpleLoading } from './components/SimpleLoading';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { Settings } from './components/Settings';
import { TodoList } from './components/TodoList';
import { PhotoGallery } from './components/PhotoGallery';
import { ProgressGrid } from './components/ProgressGrid';
import { ProfileSettings } from './components/ProfileSettings';
import { Leaderboard } from './components/Leaderboard';

// Services & Utils
import { auth } from './firebaseConfig';
import { authService } from './services/authService';
import { userService } from './services/userService';


// ⭐️ Import the new custom hooks
import { useChallengeData } from './hooks/useChallengeData';
import { useTaskManagement } from './hooks/useTaskManagement';
import { usePhotoGallery } from './hooks/usePhotoGallery';
import { useChallengeSettings } from './hooks/useChallengeSettings'; 

export default function App() {
  // State Management for Authentication
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal for days change confirmation
  const [showDaysChangeModal, setShowDaysChangeModal] = useState(false);
  const [pendingDays, setPendingDays] = useState<21 | 45 | 60 | 75 | null>(null);

  // Modal for level change confirmation
  const [showLevelChangeModal, setShowLevelChangeModal] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<'Soft' | 'Hard' | 'Custom' | null>(null);

  // Profile settings modal
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  // Memoize updateUser callback to prevent infinite re-renders
  const updateUserChallengeId = useCallback((newChallengeId: string) => {
    setUser(prev => (prev ? { ...prev, currentChallengeId: newChallengeId } : null));
  }, []);

  // ⭐️ Use the new modular hooks
  const { data, setData, loadAllProgressForChallenge, todayTasks, saveToCacheIfPossible, isFetchingTasks } = useChallengeData(
    user,
    updateUserChallengeId
  );

  const { handleTaskToggle, handleTaskAdd, handleTaskDelete, handleTaskEdit } = useTaskManagement({
    dailyProgress: data.dailyProgress,
    setDailyProgress: (updater) => setData(prev => ({ ...prev, dailyProgress: updater(prev.dailyProgress) })),
    saveToCacheIfPossible
  });

  const { photos, handlePhotoUploadFile, handlePhotoDelete } = usePhotoGallery(
    user,
    user?.currentChallengeId
  );

  // Memoize data update callbacks to prevent infinite re-renders
  const updateDays = useCallback((days: 21 | 45 | 60 | 75) => {
    setData(prev => ({ ...prev, days }));
  }, []);

  const updateLevel = useCallback((level: 'Soft' | 'Hard' | 'Custom') => {
    setData(prev => ({ ...prev, level }));
  }, []);

  const updateProgress = useCallback((updater: (prev: Record<string, any>) => Record<string, any>) => {
    setData(prev => ({ ...prev, dailyProgress: updater(prev.dailyProgress) }));
  }, []);

  const [activeTab, setActiveTab] = useState<"tasks" | "photos" | "leaderboard">("tasks");

  const {
    history,
    selectedChallengeId,
    setSelectedChallengeId,
    handleDaysChange,
    handleLevelChange,
    handleResetProgress
  } = useChallengeSettings(
    user,
    data.level,
    data.days,
    data.dailyProgress,
    updateUserChallengeId,
    updateDays,
    updateLevel,
    updateProgress,
    loadAllProgressForChallenge
  );

  // Authentication Handlers (Kept here as they deal with `user` state)
  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // Days change request handler
  const handleDaysChangeRequest = useCallback((newDays: 21 | 45 | 60 | 75) => {
    setPendingDays(newDays);
    setShowDaysChangeModal(true);
  }, []);

  // Confirm days change with reset
  const confirmDaysChangeWithReset = useCallback(() => {
    if (pendingDays) {
      handleDaysChange(pendingDays, true);
    }
    setShowDaysChangeModal(false);
    setPendingDays(null);
  }, [pendingDays, handleDaysChange]);

  // Confirm days change without reset
  const confirmDaysChangeWithoutReset = useCallback(() => {
    if (pendingDays) {
      handleDaysChange(pendingDays, false);
    }
    setShowDaysChangeModal(false);
    setPendingDays(null);
  }, [pendingDays, handleDaysChange]);

  // Cancel days change
  const cancelDaysChange = useCallback(() => {
    setShowDaysChangeModal(false);
    setPendingDays(null);
  }, []);

  // Level change request handler
  const handleLevelChangeRequest = useCallback((newLevel: 'Soft' | 'Hard' | 'Custom') => {
    setPendingLevel(newLevel);
    setShowLevelChangeModal(true);
  }, []);

  // Confirm level change with reset
  const confirmLevelChangeWithReset = useCallback(() => {
    if (pendingLevel) {
      handleLevelChange(pendingLevel, true);
    }
    setShowLevelChangeModal(false);
    setPendingLevel(null);
  }, [pendingLevel, handleLevelChange]);

  // Confirm level change without reset
  const confirmLevelChangeWithoutReset = useCallback(() => {
    if (pendingLevel) {
      handleLevelChange(pendingLevel, false);
    }
    setShowLevelChangeModal(false);
    setPendingLevel(null);
  }, [pendingLevel, handleLevelChange]);

  // Cancel level change
  const cancelLevelChange = useCallback(() => {
    setShowLevelChangeModal(false);
    setPendingLevel(null);
  }, []);

  // Profile settings handlers
  const handleProfileClick = useCallback(() => {
    setShowProfileSettings(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setShowProfileSettings(false);
  }, []);

  const handleUpdateEmail = useCallback(async (email: string) => {
    if (!user) throw new Error('User not logged in');
    if (!user._id) {
      console.error('User object missing _id:', user);
      throw new Error('User ID not available. Please try logging out and back in.');
    }
    await userService.updateEmail(user._id, email);
    // Update local user state
    setUser(prev => prev ? { ...prev, email } : null);
    return;
  }, [user]);

  const handleUpdatePassword = useCallback(async (password: string) => {
    if (!user) throw new Error('User not logged in');
    if (!user._id) {
      console.error('User object missing _id:', user);
      throw new Error('User ID not available. Please try logging out and back in.');
    }
    await userService.updatePassword(user._id, password);
    return;
  }, [user]);


  // Authentication Effect (Stays here as it manages `user` and `isLoading`)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      try {
        if (firebaseUser) {
          const authenticatedUser = await authService.verifyUser(firebaseUser);
          setUser(authenticatedUser);
        } else {
          // No Firebase user — check for a locally stored backend token
          const token = localStorage.getItem('authToken');
          if (token) {
            try {
              const result = await authService.verifyLocalToken(token);
              // If backend returned a refreshed token, store it
              if (result.token) {
                localStorage.setItem('authToken', result.token);
              }
              setUser(result.user);
            } catch (err) {
              console.warn('Local token invalid or expired, clearing session');
              localStorage.removeItem('authToken');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  // --- Render Logic ---
  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Main Application
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <Header user={user} onLogout={handleLogout} onProfileClick={handleProfileClick} />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        {activeTab === 'tasks' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Settings Panel */}
              <Settings
                days={data.days}
                level={data.level}
                onDaysChange={handleDaysChangeRequest}
                onLevelChange={handleLevelChangeRequest}
                onResetProgress={handleResetProgress}
              />

              {/* Todo List Panel */}
              {isFetchingTasks ? <SimpleLoading /> : <TodoList
                tasks={todayTasks}
                onTaskToggle={handleTaskToggle}
                onTaskAdd={handleTaskAdd}
                onTaskDelete={handleTaskDelete}
                onTaskEdit={handleTaskEdit}
                canCustomize={data.level === 'Custom'}
                startDate={data.startDate}
                dailyProgress={data.dailyProgress}
              />}
            </div>

            {/* Progress Grid */}
            <ProgressGrid
              days={data.days}
              startDate={data.startDate}
              dailyProgress={data.dailyProgress}
              history={history}
            />
          </>
        ) : activeTab === 'photos' ? (
          /* Photo Gallery */
          <>
            {console.log('Rendering PhotoGallery, photos:', photos)}
            <PhotoGallery
              photos={photos}
              onPhotoUpload={handlePhotoUploadFile}
              onPhotoDelete={handlePhotoDelete}
              history={history}
              currentChallenge={{ challengeId: user?.currentChallengeId || '', challengeDays: data.days, challengeLevel: data.level, startDate: data.startDate, status: 'active' }}
              selectedChallengeId={selectedChallengeId}
              onChallengeSelect={setSelectedChallengeId}
            />
          </>
        ) : (
          /* Leaderboard */
          <div className="max-w-4xl mx-auto">
            <Leaderboard currentUserId={user._id} />
          </div>
        )}
      </div>

      {/* Days Change Confirmation Modal */}
      {showDaysChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change Challenge Duration
            </h3>
            <p className="text-gray-600 mb-6">
              {pendingDays ? `Start a new ${pendingDays}-day challenge or ${pendingDays > data.days ? 'extend' : 'reduce'} your current one?` : ''}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDaysChangeWithReset}
                className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
              >
                Start New
              </button>
              <button
                onClick={confirmDaysChangeWithoutReset}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
              >
                {pendingDays ? (pendingDays > data.days ? 'Extend' : 'Reduce') : ''}
              </button>
              <button
                onClick={cancelDaysChange}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Change Confirmation Modal */}
      {showLevelChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change Challenge Difficulty
            </h3>
            <p className="text-gray-600 mb-6">
              Start a new {pendingLevel} challenge or update your current one to {pendingLevel}?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmLevelChangeWithReset}
                className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
              >
                Start New
              </button>
              <button
                onClick={confirmLevelChangeWithoutReset}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
              >
                Update Current
              </button>
              <button
                onClick={cancelLevelChange}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <ProfileSettings
          user={user}
          onClose={handleCloseProfile}
          onUpdateEmail={handleUpdateEmail}
          onUpdatePassword={handleUpdatePassword}
        />
      )}
    </div>
  );
}