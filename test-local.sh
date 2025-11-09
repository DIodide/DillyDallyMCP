#!/usr/bin/env bash
# Quick test script for DillyDallyMCP

set -e

echo "🧪 Testing DillyDallyMCP server..."

# Check if build exists
if [ ! -f dist/index.js ]; then
    echo "📦 Building project first..."
    npm run build
fi

echo ""
echo "✅ Build exists"
echo ""
echo "Starting server in HTTP mode for testing..."
echo "Server will be available at http://localhost:3002"
echo "Press Ctrl+C to stop"
echo ""

# Start the server
npm run dev:http



