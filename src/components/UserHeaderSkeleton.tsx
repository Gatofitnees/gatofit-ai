
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import AIChat from './AIChat';

const UserHeaderSkeleton: React.FC = () => {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {/* Avatar skeleton */}
          <div className="relative">
            <Skeleton className="w-16 h-16 rounded-full" />
          </div>
          
          <div className="ml-4">
            <div className="mb-2">
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-16" />
              <span className="text-muted-foreground">•</span>
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-2 w-32" />
          </div>
        </div>

        <AIChat />
      </div>
    </div>
  );
};

export default UserHeaderSkeleton;
