const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory ${src} does not exist. Skipping.`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${entry.name} to ${destPath}`);
    }
  }
}

const srcDir = path.join(__dirname, '..', 'assets');
const destDir = path.join(__dirname, '..', '..', 'public', 'assets');

console.log(`Copying assets from ${srcDir} to ${destDir}...`);
copyDir(srcDir, destDir);
console.log('Assets copied successfully!');
