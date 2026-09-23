export default function Loading() {
  return (
    <div className="space-y-6 md:space-y-8 w-full animate-pulse">
      <div>
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-2"></div>
        <div className="h-4 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-md"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-zinc-100 shadow-sm rounded-2xl p-5 h-32 flex flex-col justify-between">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 mb-4"></div>
            <div>
              <div className="h-8 w-16 bg-zinc-200 rounded-md mb-2"></div>
              <div className="h-3 w-24 bg-zinc-100 rounded-sm"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-zinc-100 shadow-sm rounded-2xl p-6 h-[400px]">
        <div className="h-6 w-48 bg-zinc-200 rounded-md mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center pb-4 border-b border-zinc-50 last:border-0">
              <div className="h-10 w-48 bg-zinc-100 rounded-lg"></div>
              <div className="h-8 w-24 bg-zinc-100 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
