export default function PropertyLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
      <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4"></div>
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div>
          <div className="h-10 w-96 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-2"></div>
          <div className="h-6 w-64 bg-zinc-100 dark:bg-zinc-900 rounded-md"></div>
        </div>
        <div className="h-12 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
      </div>
      
      <div className="h-[500px] w-full bg-zinc-100 dark:bg-zinc-900 rounded-3xl mb-8"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl"></div>
          <div className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-2xl"></div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
}
