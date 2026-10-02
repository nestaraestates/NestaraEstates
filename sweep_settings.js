const fs = require('fs');

const file = '/home/vini/projects122/NestaraEstates/apps/web/src/components/dashboard/ProfileForm.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Upgrade the UI architecture to match the 100% parity rule from the prompt.
  // We'll wrap it in a structural redesign.
  content = content.replace(/className="space-y-4"/g, 'className="space-y-8 bg-surface-50 p-6 rounded-2xl shadow-sm border border-zinc-100"');
  
  fs.writeFileSync(file, content);
  console.log("Upgraded Profile Settings form");
}
