#!/bin/bash

# English Leap Deployment Script
# Deploys the application to GitHub Pages

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="English Leap"
DEPLOY_BRANCH="gh-pages"
BUILD_DIR="build"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}${PROJECT_NAME} Deployment Script${NC}"
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

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed or not in PATH"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not a git repository. Please initialize git first."
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. It's recommended to commit them first."
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled."
        exit 0
    fi
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Confirm deployment
echo ""
print_step "Deployment Configuration"
echo "Project: $PROJECT_NAME"
echo "Source branch: $CURRENT_BRANCH"
echo "Deploy branch: $DEPLOY_BRANCH"
echo "Build directory: $BUILD_DIR"
echo ""

read -p "Do you want to proceed with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Deployment cancelled."
    exit 0
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
    print_error "Tests failed. Deployment aborted."
    exit 1
fi

# Build the application
print_step "Building application for production..."
npm run build --silent
if [ $? -eq 0 ]; then
    print_status "Build completed successfully ✓"
else
    print_error "Build failed. Deployment aborted."
    exit 1
fi

# Verify build output
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

# Deploy using gh-pages
print_step "Deploying to GitHub Pages..."

# Check if gh-pages is installed
if ! npm list gh-pages &> /dev/null; then
    print_status "Installing gh-pages..."
    npm install --save-dev gh-pages
fi

# Deploy to gh-pages branch
npx gh-pages -d "$BUILD_DIR" -b "$DEPLOY_BRANCH" -m "Deploy from $CURRENT_BRANCH"

if [ $? -eq 0 ]; then
    print_status "Deployment completed successfully ✓"
else
    print_error "Deployment failed"
    exit 1
fi

# Get repository URL
REPO_URL=$(git config --get remote.origin.url)
if [[ $REPO_URL == *"github.com"* ]]; then
    # Extract username and repo name
    if [[ $REPO_URL == *".git" ]]; then
        REPO_URL=${REPO_URL%.git}
    fi
    
    if [[ $REPO_URL == "https://github.com/"* ]]; then
        REPO_PATH=${REPO_URL#https://github.com/}
    elif [[ $REPO_URL == "git@github.com:"* ]]; then
        REPO_PATH=${REPO_URL#git@github.com:}
    fi
    
    PAGES_URL="https://${REPO_PATH%/*}.github.io/${REPO_PATH#*/}"
fi

# Final summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Deployment Summary:${NC}"
echo "• Source branch: $CURRENT_BRANCH"
echo "• Deploy branch: $DEPLOY_BRANCH"
echo "• Build size: $BUILD_SIZE"
echo "• Deployment time: $(date)"
echo ""

if [ -n "$PAGES_URL" ]; then
    echo -e "${BLUE}Your application will be available at:${NC}"
    echo "🌐 $PAGES_URL"
    echo ""
    echo -e "${YELLOW}Note: It may take a few minutes for GitHub Pages to update.${NC}"
else
    echo -e "${BLUE}Check your GitHub repository settings for the Pages URL.${NC}"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Wait for GitHub Pages to update (usually 1-5 minutes)"
echo "2. Test the deployed application"
echo "3. Update any DNS settings if using a custom domain"
echo "4. Share the URL with users!"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
