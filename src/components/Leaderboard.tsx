// components/Leaderboard.tsx
import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Flame, Target, CheckCircle, User as UserIcon, BicepsFlexed } from 'lucide-react';
import { userService } from '../services/userService';

interface LeaderboardEntry {
  user: {
    _id: string;
    name: string;
    photoUrl?: string;
    provider?: string;
  };
  longestStreak: number;
  currentStreak: number;
  completedChallenges: number;
  totalTasksCompleted: number;
}

interface LeaderboardProps {
  currentUserId?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUserId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.getLeaderboard();
      setLeaderboard(response.leaderboard);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <BicepsFlexed className="w-6 h-6 text-yellow-500 text-xl" />;
    return <span className="text-gray-600 font-semibold text-lg">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-white hover:bg-gray-50 scale-105 shadow-lg';
    return 'bg-white hover:bg-gray-50';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Trophy className="w-16 h-16 text-gray-300" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadLeaderboard}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Trophy className="w-16 h-16 text-gray-300" />
        <p className="text-gray-600">No competitors yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Spacer above podium for separation from tab */}
      <div className="mt-8" />

      {/* Top 5 Podium - 1st place centered, animation, and podium steps */}
      {leaderboard.length > 0 && (
        <div className="flex justify-center items-end gap-8 mb-12">
          {(() => {
            // Calculate the order for podium so 1st is always centered
            const podium = leaderboard.slice(0, 5);
            // For 2: [1,2], for 3: [2,1,3], for 4: [3,1,2,4], for 5: [4,2,1,3,5]
            const orderMap = [
              [],
              [0],
              [1,0],
              [1,0,2],
              [2,0,1,3],
              [3,1,0,2,4],
            ];
            const displayOrder = orderMap[podium.length] || podium.map((_, i) => i);
            return displayOrder.map((podiumIdx, flexIdx) => {
              const entry = podium[podiumIdx];
              const idx = podiumIdx;
              const rank = idx + 1;
              let ringClass = '';
              let bgClass = '';
              let icon = null;
              let scale = 'scale-100';
              let z = '';
              let podiumAnim = 'animate-podium-fadein';
              let stepHeight = 'h-8';
              let stepColor = 'bg-gray-200';
              let stepDelay = `${flexIdx * 120}ms`;
              if (rank === 1) {
                scale = 'scale-110';
                z = 'z-10';
                ringClass = 'ring-yellow-400 shadow-lg';
                bgClass = 'bg-yellow-100';
                icon = <Trophy className="absolute -bottom-2 -right-2 w-10 h-10 text-yellow-500" fill="gold" />;
                stepHeight = 'h-16';
                stepColor = 'bg-yellow-300';
              } else if (rank === 2) {
                scale = 'scale-100';
                z = 'z-0';
                ringClass = 'ring-gray-300';
                bgClass = 'bg-gray-200';
                icon = <Medal className="absolute -bottom-2 -right-2 w-8 h-8 text-gray-400" fill="#d1d5db" />;
                stepHeight = 'h-12';
                stepColor = 'bg-gray-300';
              } else if (rank === 3) {
                scale = 'scale-100';
                z = 'z-0';
                ringClass = 'ring-amber-500';
                bgClass = 'bg-amber-100';
                icon = <Medal className="absolute -bottom-2 -right-2 w-8 h-8 text-amber-600" fill="#d97706" />;
                stepHeight = 'h-10';
                stepColor = 'bg-amber-300';
              } else if (rank === 4) {
                scale = 'scale-95';
                z = 'z-0';
                ringClass = 'ring-blue-400';
                bgClass = 'bg-blue-100';
                icon = <Medal className="absolute -bottom-2 -right-2 w-8 h-8 text-blue-400" fill="#60a5fa" />;
                stepHeight = 'h-8';
                stepColor = 'bg-blue-200';
              } else if (rank === 5) {
                scale = 'scale-95';
                z = 'z-0';
                ringClass = 'ring-green-400';
                bgClass = 'bg-green-100';
                icon = <Medal className="absolute -bottom-2 -right-2 w-8 h-8 text-green-400" fill="#34d399" />;
                stepHeight = 'h-8';
                stepColor = 'bg-green-200';
              }
              return (
                <div
                  key={entry.user._id}
                  className={`flex flex-col items-center ${rank === 1 ? 'mb-2' : 'pt-8'} ${scale} ${z} transition-transform duration-500 ${podiumAnim}`}
                  style={{animationDelay: stepDelay}}
                >
                  <div className="relative mb-3 flex flex-col items-center">
                    {entry.user.photoUrl ? (
                      <img
                        src={entry.user.photoUrl}
                        alt={entry.user.name}
                        className={`w-${rank === 1 ? '20' : '16'} h-${rank === 1 ? '20' : '16'} rounded-full object-cover ring-4 ${ringClass}`}
                      />
                    ) : (
                      <div className={`w-${rank === 1 ? '20' : '16'} h-${rank === 1 ? '20' : '16'} rounded-full ${bgClass} flex items-center justify-center ring-4 ${ringClass}`}>
                        <UserIcon className={`w-${rank === 1 ? '10' : '8'} h-${rank === 1 ? '10' : '8'} ${rank === 1 ? 'text-yellow-600' : rank === 2 ? 'text-gray-500' : rank === 3 ? 'text-amber-600' : rank === 4 ? 'text-blue-500' : 'text-green-500'}`} />
                      </div>
                    )}
                    {icon}
                    {/* Podium Step */}
                    <div className={`w-16 ${stepHeight} ${stepColor} rounded-b-lg mt-2 shadow-md animate-podium-step`} style={{animationDelay: stepDelay}} />
                  </div>
                  <p className={`font-semibold text-sm text-center truncate w-full ${rank === 1 ? 'font-bold text-base' : ''}`}>{entry.user.name}</p>
                  <p className={`text-xs text-gray-500 flex items-center gap-1 ${rank === 1 ? 'text-sm text-gray-600' : ''}`}>
                    <Flame className={`w-${rank === 1 ? '4' : '3'} h-${rank === 1 ? '4' : '3'} ${rank === 1 ? 'text-orange-500' : ''}`} /> {entry.longestStreak} days
                  </p>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const rank = index + 1;
          const isCurrentUser = currentUserId && entry.user._id === currentUserId;
          
          return (
            <div
              key={entry.user._id}
              className={`
                ${getRankBadge(rank)}
                ${isCurrentUser ? 'ring-2 ring-amber-500 ring-offset-2' : ''}
                rounded-xl p-4 transition-all duration-200
                flex items-center gap-4 shadow-sm
              `}
            >
              {/* Rank */}
              <div className="w-12 flex items-center justify-center">
                {getRankDisplay(rank)}
              </div>

              {/* User Avatar */}
              <div className="relative flex-shrink-0">
                {entry.user.photoUrl ? (
                  <img
                    src={entry.user.photoUrl}
                    alt={entry.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                {isCurrentUser && (
                  <div className="absolute -top-1 -right-1 px-2 py-1 bg-amber-500 rounded-full flex items-center justify-center shadow">
                    <span className="text-white text-xs font-bold">You</span>
                  </div>
                )}
              </div>

              {/* User Name */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-gray-900">
                  {entry.user.name}
                </p>
                {isCurrentUser && (
                  <p className="text-xs text-amber-600 font-medium">Your position</p>
                )}
              </div>

              {/* Stats */}
              <div className="hidden sm:flex gap-4 text-sm">
                <div className="flex items-center gap-1" title="Longest Streak">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-700 font-medium">
                    {entry.longestStreak}
                  </span>
                </div>
                <div className="flex items-center gap-1" title="Completed Challenges">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700 font-medium">
                    {entry.completedChallenges}
                  </span>
                </div>
                <div className="flex items-center gap-1" title="Total Tasks Completed">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700 font-medium">
                    {entry.totalTasksCompleted}
                  </span>
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="flex sm:hidden flex-col items-end text-xs gap-1">
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-gray-700 font-medium">
                    {entry.longestStreak}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-blue-500" />
                  <span className="text-gray-700 font-medium">
                    {entry.completedChallenges}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">Stats Legend:</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" />
            <span>Longest Streak</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-blue-500" />
            <span>Challenges Done</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>Tasks Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
