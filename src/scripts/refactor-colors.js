const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'page.tsx');
console.log(`Reading file from ${filePath}...`);
let code = fs.readFileSync(filePath, 'utf8');

// Replace arbitrary variables like bg-[--color-void-950] with clean bg-void-950
const original = code;
code = code.replace(/\[--(?:color-)?([\w\-]+)\]/g, '$1');

if (original !== code) {
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully refactored all arbitrary color variables to standard Tailwind v4 classes!');
} else {
  console.log('No color refactoring was needed.');
}
