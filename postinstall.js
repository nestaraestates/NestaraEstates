const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  execSync("sed -i 's/const isV3 =.*/const isV3 = true;/g' node_modules/nativewind/dist/metro/tailwind/index.js || true");
  
  const postcssDir = path.join(__dirname, 'node_modules', '@tailwindcss', 'postcss', 'node_modules');
  fs.mkdirSync(postcssDir, { recursive: true });
  
  execSync('npm pack tailwindcss@^4.0.0 --quiet', { cwd: postcssDir });
  execSync('tar xf tailwindcss-*.tgz', { cwd: postcssDir });
  fs.renameSync(path.join(postcssDir, 'package'), path.join(postcssDir, 'tailwindcss'));
  execSync('rm tailwindcss-*.tgz', { cwd: postcssDir });

  const nodeDir = path.join(__dirname, 'node_modules', '@tailwindcss', 'node', 'node_modules');
  fs.mkdirSync(nodeDir, { recursive: true });
  
  execSync('cp -r ' + path.join(postcssDir, 'tailwindcss') + ' ' + path.join(nodeDir, 'tailwindcss'));
} catch (e) {
  console.error("Postinstall fix failed:", e);
}
