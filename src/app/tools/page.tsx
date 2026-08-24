import { EmiCalculator } from '@/components/calculators/EmiCalculator'
import { RentVsBuyCalculator } from '@/components/calculators/RentVsBuyCalculator'
import { RoiCalculator } from '@/components/calculators/RoiCalculator'

export const dynamic = 'force-dynamic'

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          Financial <span className="text-amber-500">Tools & Calculators</span>
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Make smart, data-driven real estate decisions. Use our free tools to estimate EMIs, compare renting vs buying, and calculate ROI.
        </p>
      </div>

      <div className="space-y-16">
        {/* Mortgage / EMI Calculator */}
        <section id="emi" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Mortgage / EMI Calculator</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Plan your home loan. Estimate your monthly EMI, total interest, and total payable amount.</p>
          </div>
          <EmiCalculator />
        </section>

        {/* Rent vs Buy Calculator */}
        <section id="rent-vs-buy" className="scroll-mt-24 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Rent vs Buy Calculator</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Compare the financial impact of buying a property versus continuing to rent over time.</p>
          </div>
          <RentVsBuyCalculator />
        </section>

        {/* ROI Calculator */}
        <section id="roi" className="scroll-mt-24 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Property ROI Calculator</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Evaluate an investment property. Calculate rental yields, appreciation, and total return on investment.</p>
          </div>
          <RoiCalculator />
        </section>
      </div>
    </div>
  )
}
