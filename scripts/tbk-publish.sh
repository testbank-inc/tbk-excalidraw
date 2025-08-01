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

echo "🚀 Updating version and publishing to npm..."
cd packages/excalidraw && npm version patch && npm publish && cd ../..

echo "📝 Committing version bump and pushing to git..."
NEW_VERSION=$(cd packages/excalidraw && node -p "require('./package.json').version")
git add .
git commit -m "v$NEW_VERSION - Version bump after publish"
git push

echo "✅ Publish and git push completed successfully!"