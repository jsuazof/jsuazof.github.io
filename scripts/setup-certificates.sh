#!/bin/bash

# Certificate Setup Script
# Configures the certificate system and generates all necessary files

echo "🚀 Certificate Setup Script"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Check for required tools
echo "🔍 Checking dependencies..."

missing_tools=()

if ! command -v pdftoppm &> /dev/null; then
    missing_tools+=("pdftoppm (poppler-utils)")
fi

if ! command -v cwebp &> /dev/null; then
    missing_tools+=("cwebp (webp)")
fi

if [ ${#missing_tools[@]} -ne 0 ]; then
    echo "❌ Missing required tools:"
    for tool in "${missing_tools[@]}"; do
        echo "   - $tool"
    done
    echo ""
    echo "Install missing tools:"
    echo "Ubuntu/Debian: sudo apt-get install poppler-utils webp"
    echo "macOS: brew install poppler webp"
    echo "Fedora: sudo dnf install poppler-utils libwebp-tools"
    exit 1
fi

echo "✅ All dependencies found"
echo ""

# Create directories if they don't exist
echo "📁 Creating directories..."
mkdir -p public/certificates
mkdir -p src/assets/images/certificates
echo "✅ Directories ready"
echo ""

# Generate thumbnails
echo "📸 Generating thumbnails..."
pnpm run thumbnails
echo ""

# Update certificate configuration
echo "📋 Scanning certificates..."
pnpm run certificates:update
echo ""

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the generated certificate arrays to src/pages/certificates.astro"
echo "2. Run 'npm run thumbnails:watch' to auto-generate thumbnails for new PDFs"
echo "3. Add new PDFs to public/certificates/ directory"
echo ""
echo "🔗 Useful commands:"
echo "   pnpm run thumbnails          - Generate all thumbnails"
echo "   pnpm run thumbnails:watch    - Watch for new PDFs"
echo "   pnpm run certificates:update - Update configuration"
echo ""