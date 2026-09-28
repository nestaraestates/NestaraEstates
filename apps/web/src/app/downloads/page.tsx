import Link from 'next/link'
import { Smartphone, Download, CheckCircle2, ShieldCheck, Zap, Bell, Camera, MessageSquare, Globe, ArrowRight, Gauge, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DownloadsPage() {
  const downloadLink = "https://github.com/nestaraestates/nestara-estates-releases/releases/download/nestaraestates.apk/NestaraEstates.apk";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-200 dark:border-emerald-800">
              <Smartphone className="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mb-6">
              Experience Real Estate at <span className="text-emerald-600 dark:text-emerald-500">Native Speed</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
              Take Nestara Estates everywhere you go. Browse faster, chat instantly, and get OS-level push notifications the second a new property drops.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href={downloadLink} target="_blank">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 px-8 text-lg flex items-center justify-center gap-3 rounded-xl shadow-xl shadow-emerald-600/20 transition-all hover:scale-105">
                  <Download className="h-6 w-6" />
                  Download Android APK
                </Button>
              </Link>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Version 1.0 • Free</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why the App? (Advantages) */}
      <section className="py-16 bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Built for Power Users</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-3">Why limit yourself to a browser? Unleash the full potential of your device.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-4">
                <Gauge className="h-6 w-6 text-amber-600 dark:text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Blazing Fast</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Compiled natively for Android. Zero browser overhead means pages load instantly, animations are butter-smooth, and scrolling is flawless.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">OS-Level Push Alerts</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Never miss a deal. Get phone-vibrating, lock-screen notifications the exact moment a seller replies or a matching property is listed.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-purple-600 dark:text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Native Hardware Access</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                List properties in seconds. Directly access your phone's camera to snap photos and utilize GPS for pinpoint accurate property locations.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
