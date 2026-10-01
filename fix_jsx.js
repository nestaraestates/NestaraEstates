const fs = require('fs');

let buyFile = 'apps/web/src/app/buy/page.tsx';
let buyContent = fs.readFileSync(buyFile, 'utf8');
buyContent = buyContent.replace(
  /        \{\(!properties \|\| properties\.length === 0\) && \(\n          <div className="col-span-full py-12 text-center text-zinc-500">\n            No properties found matching your criteria\.\n          <\/div>\n        \)\}\n      <\/div>\n    <\/div>/,
  '      </div>\n      )}\n    </div>'
);
fs.writeFileSync(buyFile, buyContent);

let propFile = 'apps/web/src/app/property/[id]/page.tsx';
let propContent = fs.readFileSync(propFile, 'utf8');

// I need to find where FadeIn is supposed to close. Let's look at the structure.
