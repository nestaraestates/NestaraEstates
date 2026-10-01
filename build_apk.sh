#!/bin/bash
set -e

echo "🚀 Starting Nestara Mobile Build..."

cd /home/vini/projects122/NestaraEstates/apps/mobile

echo "📦 Prebuilding Expo Native Code..."
npx expo prebuild --clean

cd android

echo "🧹 Clearing Metro Cache & Compiling APK..."
export EXPO_USE_METRO_CACHE=false
./gradlew assembleRelease -x lint -x lintVitalRelease -x lintVitalAnalyzeRelease --no-build-cache

echo "📋 Copying APK to Downloads..."
mkdir -p /home/vini/Downloads/NestaraEstates/apk/
cp app/build/outputs/apk/release/app-release.apk /home/vini/Downloads/NestaraEstates/apk/NestaraEstates.apk

echo "✅ Build Complete! The APK is ready at: /home/vini/Downloads/NestaraEstates/apk/NestaraEstates.apk"
