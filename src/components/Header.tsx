// components/Header.tsx
import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import type { User } from '../types/user';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onProfileClick }) => {
  return (
    <header className="flex flex-row justify-between items-center gap-4 mb-6">
      {/* Title Section */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          STAY <span className="underline decoration-amber-600 italic decoration-4 underline-offset-4">HARD</span>
        </h1>
        <p className="hidden sm:block text-gray-600 mt-1 text-sm md:text-base">
          Mental Toughness Challenge Tracker
        </p>
      </div>

      {/* User Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* User Avatar - Mobile: just icon, Desktop: with details card */}
        <button
          onClick={onProfileClick}
          className="sm:flex items-center gap-3 sm:bg-white sm:px-4 sm:py-2 sm:rounded-lg sm:shadow-md hover:bg-gray-50 transition-colors"
          title="View Profile"
        >
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white sm:ring-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 flex items-center justify-center ring-2 ring-white sm:ring-0 ${user.photoUrl ? 'hidden' : ''}`}>
            <UserIcon size={16} className="sm:w-5 sm:h-5 text-amber-600" />
          </div>
          
          {/* User Details - Desktop only */}
          <div className="hidden sm:block min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
        </button>

        {/* Logout Button - Mobile: icon only, Desktop: with background */}
        <button
          onClick={onLogout}
          className="p-2 sm:bg-white sm:rounded-lg sm:shadow-md hover:bg-gray-50 transition-colors text-gray-600 hover:text-red-600"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </header>
  );
};