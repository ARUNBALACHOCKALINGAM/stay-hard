// src/App.tsx (Updated File)

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
// Removed unused imports from lucide-react (Camera, List, LogOut, UserIcon)
// ... as they are likely used only in sub-components.

// Types
import type { User } from './types/user'; 
// import type { Task } from './types/task'; // No longer needed here
// import type { AppState } from './types/appstate'; // No longer needed here
// import type { ProgressPhoto } from './types/progressphoto'; // No longer needed here

// Components
import { LoginPage } from './components/LoginComponent';
import { Loading } from './components/Loading';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { Settings } from './components/Settings';
import { TodoList } from './components/TodoList';
import { PhotoGallery } from './components/PhotoGallery';
import { ProgressGrid } from './components/ProgressGrid';

// Services & Utils
import { auth } from './firebaseConfig';
import { authService } from './services/authService';
// Removed unused imports: getDefaultTasks, getTodayDate

// ⭐️ Import the new custom hook
import { useAppState } from './hooks/useAppState'; 

export default function App() {
  // State Management (Only Auth/UI state remains)
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ⭐️ Integrate the Custom Hook and destructure all state and handlers
  const { 
    state, 
    activeTab, 
    todayTasks, 
    setActiveTab, 
    handleDaysChange, 
    handleLevelChange,
    handleResetProgress,
    handleTaskToggle,
    handleTaskAdd,
    handleTaskDelete,
    handleTaskEdit,
    handlePhotoUpload,
    handlePhotoDelete,
  } = useAppState(user);

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


  // Authentication Effect (Stays here as it manages `user` and `isLoading`)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      try {
        if (firebaseUser) {
          const authenticatedUser = await authService.verifyUser(firebaseUser);
          setUser(authenticatedUser);
        } else {
          setUser(null);
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
        <Header user={user} onLogout={handleLogout} />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        {activeTab === 'tasks' ? (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Settings Panel */}
              <Settings
                days={state.days}
                level={state.level}
                onDaysChange={handleDaysChange}
                onLevelChange={handleLevelChange}
                onResetProgress={handleResetProgress}
              />

              {/* Todo List Panel */}
              <TodoList
                tasks={todayTasks}
                onTaskToggle={handleTaskToggle}
                onTaskAdd={handleTaskAdd}
                onTaskDelete={handleTaskDelete}
                onTaskEdit={handleTaskEdit}
                canCustomize={state.level === 'Custom'}
              />
            </div>

            {/* Progress Grid */}
            <ProgressGrid
              days={state.days}
              startDate={state.startDate}
              dailyProgress={state.dailyProgress}
            />
          </>
        ) : (
          /* Photo Gallery */
          <PhotoGallery
            photos={state.photos}
            onPhotoUpload={handlePhotoUpload}
            onPhotoDelete={handlePhotoDelete}
          />
        )}
      </div>
    </div>
  );
}