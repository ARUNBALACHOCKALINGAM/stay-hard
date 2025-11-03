// components/Header.tsx
import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import type { User } from '../types/user';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      {/* Title Section */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          STAY <span className="underline decoration-amber-600 decoration-4 underline-offset-4">HARD</span>
        </h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          Mental Toughness Challenge Tracker
        </p>
      </div>

      {/* User Section */}
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
        {/* User Info Card */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md flex-1 sm:flex-initial">
          {/* Avatar */}
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <UserIcon size={16} className="text-amber-600" />
            </div>
          )}
          
          {/* Fallback Icon (hidden by default) */}
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center hidden">
            <UserIcon size={16} className="text-amber-600" />
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors text-gray-600 hover:text-red-600 flex-shrink-0"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};