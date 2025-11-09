#!/bin/bash
set -e

echo "🚀 Setting up DillyDallyMCP repository..."

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Make initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Dedalus MCP server" || echo "No changes to commit"

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "To test locally:"
echo "  STDIO mode: npm run dev:stdio"
echo "  HTTP mode:  npm run dev:http"
echo ""
echo "To create remote repository:"
echo "  git remote add origin <your-repo-url>"
echo "  git push -u origin main"



