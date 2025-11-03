// components/TabNavigation.tsx
import React from 'react';
import { Camera, List } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'tasks' | 'photos';
  onTabChange: (tab: 'tasks' | 'photos') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const tabs = [
    { id: 'tasks' as const, label: 'Tasks', icon: List },
    { id: 'photos' as const, label: 'Photos', icon: Camera },
  ];

  return (
    <nav className="flex justify-center mb-6" aria-label="Main navigation">
      <div className="bg-white rounded-lg shadow-md p-1 flex gap-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`
              px-4 sm:px-6 py-2 rounded-md font-medium transition-colors 
              flex items-center gap-2
              ${activeTab === id
                ? 'bg-amber-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
            aria-label={`Switch to ${label} tab`}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            <Icon size={20} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};