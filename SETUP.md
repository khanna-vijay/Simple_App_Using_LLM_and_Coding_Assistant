# English Leap - Setup Guide

This guide will help you set up English Leap for development, testing, and deployment.

## 📋 Prerequisites

### Required Software
- **Node.js** 14.0 or higher ([Download](https://nodejs.org/))
- **npm** 6.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Recommended Tools
- **VS Code** with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - Bracket Pair Colorizer

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/english-leap.git
cd english-leap
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

## 🛠️ Development Setup

### Environment Configuration
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your preferences:
   ```env
   REACT_APP_NAME=English Leap
   REACT_APP_ENV=development
   REACT_APP_DEBUG=true
   ```

### Available Scripts

#### Development
```bash
npm start          # Start development server
npm test           # Run tests in watch mode
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues automatically
npm run format     # Format code with Prettier
```

#### Production
```bash
npm run build      # Build for production
npm run analyze    # Analyze bundle size
npm run deploy     # Deploy to GitHub Pages
```

#### Testing
```bash
npm test                    # Run tests in watch mode
npm test -- --coverage     # Run tests with coverage
npm run test:ci            # Run tests once (CI mode)
```

## 📁 Project Structure

```
english-leap/
├── public/                 # Static assets
│   ├── audio/             # Pronunciation audio files
│   ├── data/              # Dictionary JSON data
│   ├── favicon.jpg        # App favicon
│   └── index.html         # HTML template
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── common/       # Common components
│   │   └── layout/       # Layout components
│   ├── context/          # React context providers
│   ├── pages/            # Main page components
│   ├── services/         # Business logic and APIs
│   ├── utils/            # Utility functions
│   ├── App.js            # Main App component
│   └── index.js          # Entry point
├── docs/                 # Documentation
├── scripts/              # Build and deployment scripts
├── .github/              # GitHub workflows and templates
└── package.json          # Dependencies and scripts
```

## 🎯 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm start
npm test

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### 2. Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run tests with coverage
npm test -- --coverage
```

### 3. Build and Deploy
```bash
# Build for production
npm run build

# Test production build locally
npx serve -s build

# Deploy to GitHub Pages
npm run deploy
```

## 🧪 Testing

### Test Structure
```
src/
├── components/
│   └── __tests__/        # Component tests
├── services/
│   └── __tests__/        # Service tests
├── utils/
│   └── __tests__/        # Utility tests
└── setupTests.js         # Test configuration
```

### Writing Tests
```javascript
// Component test example
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

test('renders component correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Test Commands
```bash
npm test                    # Interactive watch mode
npm test -- --coverage     # With coverage report
npm test -- --watchAll=false  # Run once
npm test MyComponent        # Test specific component
```

## 🚀 Deployment

### GitHub Pages (Recommended)
1. **Automatic Deployment** (via GitHub Actions):
   - Push to `main` branch triggers automatic deployment
   - Check `.github/workflows/ci.yml` for configuration

2. **Manual Deployment**:
   ```bash
   npm run deploy
   ```

### Other Platforms

#### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

#### Custom Server
```bash
# Build the application
npm run build

# Upload the 'build' folder to your web server
# Configure server for SPA routing
```

## 🔧 Configuration

### Environment Variables
Create `.env` file for local development:
```env
# App Configuration
REACT_APP_NAME=English Leap
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_OFFLINE=true
REACT_APP_ENABLE_BACKUP=true

# Development
REACT_APP_DEBUG=true
```

### Build Configuration
Modify `package.json` for custom build settings:
```json
{
  "homepage": "https://yourusername.github.io/english-leap",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Use Node Version Manager (if installed)
nvm use 18
```

#### Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Issues
```bash
# Check for TypeScript errors
npm run build

# Increase memory limit for large builds
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm start
```

### Getting Help
- 📖 Check [User Guide](docs/user/QUICK_START_GUIDE.md)
- 🐛 Report issues on [GitHub Issues](https://github.com/yourusername/english-leap/issues)
- 💬 Ask questions in [Discussions](https://github.com/yourusername/english-leap/discussions)

## 📚 Additional Resources

### Documentation
- [Contributing Guide](CONTRIBUTING.md)
- [User Guide](docs/user/QUICK_START_GUIDE.md)
- [Architecture Documentation](docs/architecture/)
- [API Documentation](api/openapi.yaml)

### External Resources
- [React Documentation](https://reactjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [Create React App Documentation](https://create-react-app.dev/)
- [Jest Testing Framework](https://jestjs.io/)

---

**Happy Coding!** 🚀

If you encounter any issues with this setup guide, please [create an issue](https://github.com/yourusername/english-leap/issues) or contribute improvements via pull request.
