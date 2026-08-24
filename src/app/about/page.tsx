import { Building2, Target, Eye, ShieldCheck, Users, TrendingUp } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight">
          About <span className="text-amber-500">Nestara Estates</span>
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
          We are building a modern, technology-driven real-estate platform focused on making property buying, selling, renting, and verification simpler, safer, and more transparent.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 text-blue-600 dark:text-blue-400">
            <Target className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Our Mission</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            To make property discovery, transactions, and verification more transparent, convenient, and technology-driven. We believe that finding your dream home or next investment should be an exciting journey, not a stressful ordeal.
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="bg-amber-100 dark:bg-amber-900/30 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 text-amber-600 dark:text-amber-400">
            <Eye className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Our Vision</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            To become the most trusted property-tech platform connecting all stakeholders—buyers, sellers, tenants, and verified dealers. We envision a future where every real estate transaction is backed by verified data and seamless digital experiences.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-zinc-900 dark:text-white">Why Nestara Was Created</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto bg-emerald-50 dark:bg-emerald-900/20 w-16 h-16 flex items-center justify-center rounded-full mb-4 text-emerald-600">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Trust & Transparency</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Every property undergoes strict verification to ensure you get exactly what you see.</p>
          </div>
          <div className="text-center">
            <div className="mx-auto bg-purple-50 dark:bg-purple-900/20 w-16 h-16 flex items-center justify-center rounded-full mb-4 text-purple-600">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Technology First</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Advanced search, smart calculators, and digital processes make real estate faster.</p>
          </div>
          <div className="text-center">
            <div className="mx-auto bg-blue-50 dark:bg-blue-900/20 w-16 h-16 flex items-center justify-center rounded-full mb-4 text-blue-600">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Convenience</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Discovery, comparison, verification, and communication—all in one single platform.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
