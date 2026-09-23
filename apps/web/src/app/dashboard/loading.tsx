export default function DashboardLoading() {
  return (
    <div className="w-full h-full space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
      
      {/* Tabs Skeleton */}
      <div className="flex space-x-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="h-10 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-lg"></div>
        <div className="h-10 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-lg"></div>
      </div>
      
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 bg-zinc-100 dark:bg-zinc-900 rounded-2xl"></div>
        ))}
      </div>
    </div>
  )
}
