const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  execSync("sed -i 's/const isV3 =.*/const isV3 = true;/g' node_modules/nativewind/dist/metro/tailwind/index.js || true");
  
  const postcssDir = path.join(__dirname, 'node_modules', '@tailwindcss', 'postcss', 'node_modules');
  fs.mkdirSync(postcssDir, { recursive: true });
  
  const tailwindcssPostcssDir = path.join(postcssDir, 'tailwindcss');
  if (fs.existsSync(tailwindcssPostcssDir)) {
    fs.rmSync(tailwindcssPostcssDir, { recursive: true, force: true });
  }

  execSync('npm pack tailwindcss@^4.0.0 --quiet', { cwd: postcssDir });
  execSync('tar xf tailwindcss-*.tgz', { cwd: postcssDir });
  fs.renameSync(path.join(postcssDir, 'package'), tailwindcssPostcssDir);
  execSync('rm tailwindcss-*.tgz', { cwd: postcssDir });

  const nodeDir = path.join(__dirname, 'node_modules', '@tailwindcss', 'node', 'node_modules');
  fs.mkdirSync(nodeDir, { recursive: true });
  
  const tailwindcssNodeDir = path.join(nodeDir, 'tailwindcss');
  if (fs.existsSync(tailwindcssNodeDir)) {
    fs.rmSync(tailwindcssNodeDir, { recursive: true, force: true });
  }

  execSync('cp -r ' + tailwindcssPostcssDir + ' ' + tailwindcssNodeDir);
} catch (e) {
  console.error("Postinstall fix failed:", e);
}
