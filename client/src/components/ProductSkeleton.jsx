import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="flex flex-col border border-neutral-100 bg-white p-4">
      {/* Image Skeleton */}
      <div className="animate-shimmer aspect-square bg-neutral-200"></div>

      {/* Info Skeletons */}
      <div className="mt-4 space-y-2">
        <div className="animate-shimmer h-3 w-1/4 bg-neutral-200"></div>
        <div className="animate-shimmer h-4 w-3/4 bg-neutral-200"></div>
        <div className="animate-shimmer h-3 w-1/2 bg-neutral-200"></div>

        {/* Pricing / Cart Skeleton */}
        <div className="mt-4 pt-2 flex items-center justify-between">
          <div className="animate-shimmer h-4 w-1/3 bg-neutral-200"></div>
          <div className="animate-shimmer h-8 w-8 rounded-full bg-neutral-200"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
