const fs = require('fs');

const file = '/home/vini/projects122/NestaraEstates/apps/web/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// A very basic structural update to begin the UI revamp.
const updatedContent = content.replace(
  '<div className="flex flex-col min-h-screen">',
  '<div className="flex flex-col min-h-screen bg-surface-50 text-surface-900">'
);

fs.writeFileSync(file, updatedContent);
console.log("Updated Home Page shell");
