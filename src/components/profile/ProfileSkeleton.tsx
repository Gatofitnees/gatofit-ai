
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Settings, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" className="p-2" disabled>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-bold">Mi Perfil</h1>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="p-2" disabled>
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2" disabled>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="text-center mb-6">
        <div className="relative inline-flex">
          <Skeleton className="w-20 h-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32 mx-auto mt-2" />
        <Skeleton className="h-3 w-24 mx-auto mt-1" />
      </div>

      {/* Profile Form */}
      <div className="space-y-4 mb-6">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div>
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Body Measurements Section */}
      <div className="mb-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center p-3 bg-secondary/20 rounded-xl">
              <Skeleton className="h-3 w-12 mx-auto mb-1" />
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* User Information Section */}
      <div className="mb-6">
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center p-3 bg-secondary/20 rounded-xl">
              <Skeleton className="h-3 w-16 mx-auto mb-1" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center p-4 bg-secondary/20 rounded-xl">
              <Skeleton className="h-6 w-8 mx-auto mb-2" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 space-y-3">
        <Skeleton className="h-5 w-36 mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
};

export default ProfileSkeleton;
