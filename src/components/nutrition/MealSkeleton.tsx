import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const MealSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Meal Header */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-32" />
        
        {/* Options skeleton */}
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>

      {/* Ingredients skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-card rounded-lg">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex space-x-4">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const OptionSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-card rounded-lg opacity-50">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <div className="flex space-x-4">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
          <Skeleton className="h-8 w-14" />
        </div>
      ))}
    </div>
  );
};

export const RecipeSkeleton: React.FC = () => {
  return (
    <div className="bg-card rounded-lg p-4 space-y-3 animate-pulse">
      <div className="flex items-start space-x-3">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
};