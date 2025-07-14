#!/bin/bash

# English Leap Build Script
# Builds the React application for production deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="English Leap"
BUILD_DIR="build"
DIST_DIR="dist"
NODE_MIN_VERSION="14"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}${PROJECT_NAME} Build Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check Node.js version
print_step "Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "$NODE_MIN_VERSION" ]; then
    print_error "Node.js version $NODE_MIN_VERSION or higher is required. Current version: $(node --version)"
    exit 1
fi
print_status "Node.js version: $(node --version) ✓"

# Check npm availability
print_step "Checking npm availability..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed or not in PATH"
    exit 1
fi
print_status "npm version: $(npm --version) ✓"

# Clean previous builds
print_step "Cleaning previous builds..."
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    print_status "Removed existing build directory"
fi

if [ -d "$DIST_DIR" ]; then
    rm -rf "$DIST_DIR"
    print_status "Removed existing dist directory"
fi

# Install dependencies
print_step "Installing dependencies..."
npm ci --silent
if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Run tests
print_step "Running tests..."
npm test -- --coverage --watchAll=false --silent
if [ $? -eq 0 ]; then
    print_status "All tests passed ✓"
else
    print_error "Tests failed"
    exit 1
fi

# Run linting
print_step "Running ESLint..."
npm run lint --silent
if [ $? -eq 0 ]; then
    print_status "Linting passed ✓"
else
    print_warning "Linting issues found, but continuing build..."
fi

# Build the application
print_step "Building React application..."
npm run build --silent
if [ $? -eq 0 ]; then
    print_status "Build completed successfully ✓"
else
    print_error "Build failed"
    exit 1
fi

# Verify build output
print_step "Verifying build output..."
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build directory not found"
    exit 1
fi

if [ ! -f "$BUILD_DIR/index.html" ]; then
    print_error "index.html not found in build directory"
    exit 1
fi

# Calculate build size
BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
print_status "Build size: $BUILD_SIZE"

# List main build files
print_status "Build contents:"
ls -la "$BUILD_DIR"

# Check for critical files
CRITICAL_FILES=("index.html" "static/js" "static/css")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -e "$BUILD_DIR/$file" ]; then
        print_status "✓ $file found"
    else
        print_warning "⚠ $file not found"
    fi
done

# Generate build report
print_step "Generating build report..."
BUILD_REPORT="build-report-$(date +%Y%m%d-%H%M%S).txt"
{
    echo "English Leap Build Report"
    echo "========================="
    echo "Build Date: $(date)"
    echo "Node Version: $(node --version)"
    echo "npm Version: $(npm --version)"
    echo "Build Size: $BUILD_SIZE"
    echo ""
    echo "Build Contents:"
    ls -la "$BUILD_DIR"
    echo ""
    echo "Package Dependencies:"
    npm list --depth=0
} > "$BUILD_REPORT"

print_status "Build report saved to: $BUILD_REPORT"

# Optional: Create distribution package
if [ "$1" = "--package" ]; then
    print_step "Creating distribution package..."
    
    # Create dist directory
    mkdir -p "$DIST_DIR"
    
    # Copy build files
    cp -r "$BUILD_DIR"/* "$DIST_DIR/"
    
    # Copy additional files for deployment
    if [ -f "README.md" ]; then
        cp "README.md" "$DIST_DIR/"
    fi
    
    if [ -f "LICENSE" ]; then
        cp "LICENSE" "$DIST_DIR/"
    fi
    
    # Create deployment info
    {
        echo "English Leap Deployment Package"
        echo "==============================="
        echo "Build Date: $(date)"
        echo "Version: $(node -p "require('./package.json').version")"
        echo "Build Size: $BUILD_SIZE"
        echo ""
        echo "Deployment Instructions:"
        echo "1. Upload contents to web server"
        echo "2. Configure server for SPA routing"
        echo "3. Ensure HTTPS is enabled"
        echo "4. Set appropriate cache headers"
    } > "$DIST_DIR/DEPLOYMENT.md"
    
    print_status "Distribution package created in: $DIST_DIR"
fi

# Performance analysis (if bundle analyzer is available)
if npm list webpack-bundle-analyzer &> /dev/null; then
    print_step "Generating bundle analysis..."
    npm run analyze --silent &
    ANALYZE_PID=$!
    sleep 3
    kill $ANALYZE_PID 2>/dev/null || true
    print_status "Bundle analysis available (check browser)"
fi

# Final summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}BUILD COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "• Build directory: $BUILD_DIR"
echo "• Build size: $BUILD_SIZE"
echo "• Build report: $BUILD_REPORT"
if [ "$1" = "--package" ]; then
    echo "• Distribution package: $DIST_DIR"
fi
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Test the build locally: npx serve build"
echo "2. Deploy to staging environment"
echo "3. Run end-to-end tests"
echo "4. Deploy to production"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
