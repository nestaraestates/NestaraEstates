import Link from 'next/link'
import { Download } from 'lucide-react'

export function DownloadAppButton({ className = "" }: { className?: string }) {
  return (
    <Link 
      href="https://github.com/nestaraestates/nestara-estates-releases/releases/download/nestaraestates.apk/NestaraEstates.apk" 
      target="_blank"
      className={`inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors ${className}`}
    >
      <Download className="h-5 w-5" />
      <span>Download Android App</span>
    </Link>
  )
}
