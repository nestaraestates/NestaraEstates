const fs = require('fs');

const file = '/home/vini/projects122/NestaraEstates/apps/web/src/app/page.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const newHero = `      {/* Hero Section */}
      <section className="relative flex py-16 items-center justify-center overflow-hidden bg-surface-900 border-b border-surface-800">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2070")' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-900/80 to-surface-900/40" />
        </div>

        <div className="container relative z-10 mx-auto px-4 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 max-w-2xl text-left">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-5xl">
              Find a Property <span className="text-brand-400">You Can Trust.</span>
            </h1>
            <p className="mb-6 text-base text-surface-300 md:text-lg font-medium leading-relaxed max-w-xl">
              Discover, compare, verify and connect with premium properties through Nestara Estates.
            </p>
            <div className="flex items-center gap-6 text-sm font-semibold text-surface-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand-500" /> Verified</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-500" /> Prime Locations</span>
            </div>
          </div>

          <div className="w-full md:w-[480px] bg-white rounded-xl shadow-2xl overflow-hidden border border-surface-200">
            <HomeSearch />
          </div>
        </div>
      </section>`;

// Replace lines 26 to 72
lines.splice(26, 47, newHero);

fs.writeFileSync(file, lines.join('\n'));
console.log("Replaced exactly lines 26-72 with the compact hero");
