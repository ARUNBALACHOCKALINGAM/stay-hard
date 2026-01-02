// components/TabNavigation.tsx
import React from 'react';
import { Camera, Dumbbell, Trophy } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'tasks' | 'photos' | 'leaderboard';
  onTabChange: (tab: 'tasks' | 'photos' | 'leaderboard') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <nav className="flex justify-center gap-2 mb-6" aria-label="Main navigation">
      {/* Tasks Tab */}
      <button
        onClick={() => onTabChange('tasks')}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-medium
          transition-all duration-200 shadow-sm
          ${activeTab === 'tasks'
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105'
            : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow'
          }
        `}
        aria-label="View Tasks"
        aria-current={activeTab === 'tasks' ? 'page' : undefined}
      >
        <Dumbbell size={20} />
        <span className="hidden sm:inline">Tasks</span>
      </button>

      {/* Photos Tab */}
      <button
        onClick={() => onTabChange('photos')}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-medium
          transition-all duration-200 shadow-sm
          ${activeTab === 'photos'
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105'
            : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow'
          }
        `}
        aria-label="View Photos"
        aria-current={activeTab === 'photos' ? 'page' : undefined}
      >
        <Camera size={20} />
        <span className="hidden sm:inline">Photos</span>
      </button>

      {/* Leaderboard Tab */}
      <button
        onClick={() => onTabChange('leaderboard')}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-medium
          transition-all duration-200 shadow-sm
          ${activeTab === 'leaderboard'
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105'
            : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow'
          }
        `}
        aria-label="View Leaderboard"
        aria-current={activeTab === 'leaderboard' ? 'page' : undefined}
      >
        <Trophy size={20} />
        <span className="hidden sm:inline">Leaderboard</span>
      </button>
    </nav>
  );
};