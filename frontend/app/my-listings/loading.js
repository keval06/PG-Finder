import Skeleton from "../atoms/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
      <div className="flex gap-6">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </aside>

        {/* Content Skeleton */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <Skeleton className="h-10 w-64 rounded-xl" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
