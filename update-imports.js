#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TypeScript and JavaScript files in packages directory
const findFiles = (dir, extensions) => {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
};

// Update import statements in a file
const updateImports = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace import statements
  const updatedContent = content
    .replace(/from ["']@excalidraw\/common["']/g, `from "@testbank-inc/common"`)
    .replace(/from ["']@excalidraw\/element["']/g, `from "@testbank-inc/element"`)
    .replace(/from ["']@excalidraw\/math["']/g, `from "@testbank-inc/math"`)
    .replace(/import ["']@excalidraw\/common["']/g, `import "@testbank-inc/common"`)
    .replace(/import ["']@excalidraw\/element["']/g, `import "@testbank-inc/element"`)
    .replace(/import ["']@excalidraw\/math["']/g, `import "@testbank-inc/math"`);
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated: ${filePath}`);
  }
};

// Main execution
const packagesDir = path.join(__dirname, 'packages');
const extensions = ['.ts', '.tsx', '.js', '.jsx'];
const files = findFiles(packagesDir, extensions);

console.log(`Found ${files.length} files to process...`);

files.forEach(updateImports);

console.log('Import updates completed!');