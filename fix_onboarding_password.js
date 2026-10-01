const fs = require('fs');

let file = 'apps/mobile/src/app/(auth)/onboarding.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the container
content = content.replace(
  /<View className="bg-amber-50 border border-amber-300 rounded-xl p-5 space-y-4 shadow-sm">/g,
  '<View className="bg-white/10 border border-white/20 rounded-[32px] p-6 space-y-4 shadow-sm backdrop-blur-xl mt-4">'
);

// Replace the title
content = content.replace(
  /<Text className="text-lg font-bold text-amber-900 mb-1">Create Password<\/Text>/g,
  '<Text className="text-xl font-bold text-white mb-1">Create Password</Text>'
);

// Replace the labels
content = content.replace(
  /<Text className="text-sm font-medium text-amber-900">Password<\/Text>/g,
  '<Text className="text-sm font-medium text-white mb-1 ml-1">Password</Text>'
);
content = content.replace(
  /<Text className="text-sm font-medium text-amber-900">Confirm Password<\/Text>/g,
  '<Text className="text-sm font-medium text-white mb-1 ml-1">Confirm Password</Text>'
);

// Replace the subtitle
content = content.replace(
  /<Text className="text-xs text-white mb-2">Since you signed in with Google, please create a password for email login.<\/Text>/g,
  '<Text className="text-xs text-zinc-300 mb-2 ml-1">Since you signed in with Google, please create a password for email login.</Text>'
);

// Replace the TextInputs
content = content.replace(
  /className="w-full bg-white border border-amber-300 rounded-md px-3 py-2\.5 pr-10 text-white"/g,
  'className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white"'
);

// Replace the Pressable absolute position to match the new larger padding
content = content.replace(
  /className="absolute right-3 top-3"/g,
  'className="absolute right-4 h-full justify-center"'
);

fs.writeFileSync(file, content);
