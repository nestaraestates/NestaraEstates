export default function Loading() {
  return (
    <div className="flex h-[70vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600"></div>
        <p className="text-sm font-medium text-zinc-500 animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
