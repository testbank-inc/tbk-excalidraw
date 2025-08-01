#!/bin/bash
set -e

echo "🧹 Cleaning directories..."
rm -rf node_modules
rm -rf .yarn  
rm -rf packages/excalidraw/node_modules
rm -rf packages/excalidraw/dist

echo "📦 Installing dependencies..."
yarn install

echo "⏳ Waiting for workspace to be ready..."
sleep 2

echo "🔨 Building package..."
cd packages/excalidraw && node ../../scripts/buildPackage.js && cd ../..

echo "🏷️ Committing changes and updating version..."
git add .
git commit -m "Update for publish" || echo "No changes to commit"
npm version patch

echo "🚀 Publishing to npm..."
npm publish

echo "✅ Publish completed successfully!"