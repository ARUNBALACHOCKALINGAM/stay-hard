import React from 'react';
import { Dumbbell } from 'lucide-react';

// Main Loading Component
export const Loading: React.FC<{ message?: string }> = ({ 
  message = "Signing you in..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-screen h-screen">
      {/* Animated Dumbbell */}
      <div className="relative">
        <div className="animate-bounce">
          <Dumbbell size={48} className="text-amber-600" strokeWidth={2.5} />
        </div>
        
        {/* Pulsing circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-200 rounded-full animate-ping opacity-75"></div>
        </div>
      </div>

      {/* Loading dots */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
      </div>

      {/* Message */}
      <p className="text-gray-600 font-medium animate-pulse">{message}</p>
    </div>
  );
};