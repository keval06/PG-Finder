import Skeleton from "../atoms/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex gap-6">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <Skeleton className="h-[500px] w-full" />
        </aside>

        {/* Content Skeleton */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-64" />
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
