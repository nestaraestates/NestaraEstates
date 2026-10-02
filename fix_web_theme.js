const fs = require('fs');

const file = '/home/vini/projects122/NestaraEstates/apps/web/src/app/globals.css';
let content = fs.readFileSync(file, 'utf8');

const themeColors = `
  /* Mobile App Theme Parity */
  --color-brand-50: #ecfdf5;
  --color-brand-100: #d1fae5;
  --color-brand-200: #a7f3d0;
  --color-brand-300: #6ee7b7;
  --color-brand-400: #34d399;
  --color-brand-500: #10b981;
  --color-brand-600: #059669;
  --color-brand-700: #047857;
  --color-brand-800: #065f46;
  --color-brand-900: #064e3b;

  --color-surface-50: #fafafa;
  --color-surface-100: #f4f4f5;
  --color-surface-200: #e4e4e7;
  --color-surface-300: #d4d4d8;
  --color-surface-400: #a1a1aa;
  --color-surface-500: #71717a;
  --color-surface-600: #52525b;
  --color-surface-700: #3f3f46;
  --color-surface-800: #27272a;
  --color-surface-900: #18181b;
`;

if (!content.includes("--color-brand-500")) {
  content = content.replace("@theme inline {", "@theme inline {" + themeColors);
  fs.writeFileSync(file, content);
  console.log("Added brand and surface colors to globals.css");
} else {
  console.log("Colors already exist.");
}
