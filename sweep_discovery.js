const fs = require('fs');
const path = require('path');

const pages = [
  'apps/web/src/app/buy/page.tsx',
  'apps/web/src/app/rent/page.tsx',
  'apps/web/src/app/commercial/page.tsx'
];

for (const p of pages) {
  const fullPath = path.join('/home/vini/projects122/NestaraEstates', p);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Upgrade container layouts
    content = content.replace(/className="container mx-auto px-4 py-8"/g, 'className="container mx-auto px-4 py-8 max-w-7xl"');
    content = content.replace(/className="container mx-auto py-8"/g, 'className="container mx-auto py-8 px-4 max-w-7xl"');
    
    // Ensure responsive grid is optimized
    content = content.replace(/grid-cols-1 md:grid-cols-2 lg:grid-cols-3/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6');
    
    // Inject brand tokens if missing
    content = content.replace(/bg-gray-50/g, 'bg-surface-50');
    content = content.replace(/bg-zinc-50/g, 'bg-surface-50');
    content = content.replace(/text-gray-900/g, 'text-surface-900');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Upgraded UI/UX shell for ${p}`);
  }
}
