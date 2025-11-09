// components/TabNavigation.tsx
import React from 'react';
import { Camera, BookOpen } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'tasks' | 'photos';
  onTabChange: (tab: 'tasks' | 'photos') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const handleToggle = () => {
    onTabChange(activeTab === 'tasks' ? 'photos' : 'tasks');
  };

  const isTasksView = activeTab === 'tasks';

  return (
    <nav className="justify-center flex mb-6" aria-label="Main navigation">
      <button
        onClick={handleToggle}
        className="group relative bg-gradient-to-r from-amber-500 to-orange-500 
                   text-white rounded-full p-4 shadow-lg hover:shadow-xl 
                   transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label={`Switch to ${isTasksView ? 'Photos' : 'Tasks'} view`}
        title={`Switch to ${isTasksView ? 'Photos' : 'Tasks'}`}
      >
        {/* Icon Container with Animation */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* Tasks Icon (BookOpen) */}
          <BookOpen
            size={24}
            className={`absolute transition-all duration-500 transform ${
              !isTasksView
                ? 'opacity-100 rotate-0 scale-100'
                : 'opacity-0 -rotate-180 scale-50'
            }`}
          />
          
          {/* Photos Icon (Camera) */}
          <Camera
            size={24}
            className={`absolute transition-all duration-500 transform ${
              isTasksView
                ? 'opacity-100 rotate-0 scale-100'
                : 'opacity-0 rotate-180 scale-50'
            }`}
          />
        </div>

        {/* Tooltip on Hover */}
        <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 
                         bg-gray-900 text-white text-sm px-3 py-1.5 rounded-md 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         whitespace-nowrap pointer-events-none">
          {isTasksView ? 'View Photos' : 'View Tasks'}
        </span>
      </button>
    </nav>
  );
};