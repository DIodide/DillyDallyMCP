#!/usr/bin/env bash
# Setup script for DillyDallyMCP repository

set -e

echo "🚀 Setting up DillyDallyMCP repository..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "ℹ️  Git repository already initialized"
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Creating initial commit..."
    git commit -m "Initial commit: Dedalus MCP server" || true
    echo "✅ Initial commit created"
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Build the project
echo "🔨 Building project..."
npm run build
echo "✅ Build complete"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Create a new repository on GitHub/GitLab named 'DillyDallyMCP'"
echo "  2. Run: git remote add origin <your-repo-url>"
echo "  3. Run: git branch -M main"
echo "  4. Run: git push -u origin main"
echo ""
echo "🧪 To test locally:"
echo "  STDIO mode: npm run dev:stdio"
echo "  HTTP mode:  npm run dev:http"
echo "  Inspector:   npm run inspector"


