#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const PACKAGES = ["common", "math", "element", "excalidraw"];

console.log("Building packages in order...");

for (const packageName of PACKAGES) {
  console.log(`\nBuilding @testbank-inc/${packageName}...`);
  
  try {
    const packagePath = path.resolve(__dirname, `packages/${packageName}`);
    execSync(`yarn build:esm`, {
      cwd: packagePath,
      stdio: 'inherit'
    });
    
    console.log(`✅ Successfully built @testbank-inc/${packageName}`);
  } catch (error) {
    console.error(`❌ Failed to build @testbank-inc/${packageName}`);
    console.error(error.message);
    process.exit(1);
  }
}

console.log("\n🎉 All packages built successfully!");