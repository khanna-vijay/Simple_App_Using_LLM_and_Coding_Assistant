# Contributing to English Leap

Thank you for your interest in contributing to English Leap! We welcome contributions from developers of all skill levels.

## 🚀 Getting Started

### Prerequisites
- Node.js 14.0 or higher
- npm 6.0 or higher
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/english-leap.git
   cd english-leap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## 📋 How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/english-leap/issues)
2. Create a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Browser and OS information

### Suggesting Features
1. Check [existing feature requests](https://github.com/yourusername/english-leap/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
2. Create a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach

### Code Contributions

#### 1. Choose an Issue
- Look for issues labeled `good first issue` for beginners
- Comment on the issue to let others know you're working on it

#### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

#### 3. Make Changes
- Follow the existing code style
- Add tests for new functionality
- Update documentation if needed

#### 4. Test Your Changes
```bash
npm test
npm run lint
npm run build
```

#### 5. Commit Your Changes
Use conventional commit messages:
```bash
git commit -m "feat: add new flashcard animation"
git commit -m "fix: resolve audio playback issue"
git commit -m "docs: update installation guide"
```

#### 6. Submit a Pull Request
- Push your branch to your fork
- Create a pull request with:
  - Clear title and description
  - Reference to related issues
  - Screenshots (if UI changes)

## 🎨 Code Style

### JavaScript/React
- Use functional components with hooks
- Follow ESLint configuration (Airbnb style guide)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### CSS/Styling
- Use Material-UI components when possible
- Follow BEM methodology for custom CSS
- Ensure responsive design
- Test on multiple screen sizes

### File Organization
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── common/       # Common components
│   └── [feature]/    # Feature-specific components
├── pages/            # Page components
├── context/          # React context providers
├── services/         # Business logic
├── utils/            # Utility functions
└── __tests__/        # Test files
```

## 🧪 Testing

### Writing Tests
- Write unit tests for utility functions
- Write integration tests for components
- Use React Testing Library for component tests
- Aim for 80%+ test coverage

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --coverage     # Run with coverage
npm test -- --watch        # Watch mode
```

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for public functions
- Include usage examples in component documentation
- Update README.md for new features

### User Documentation
- Update user guides for new features
- Add screenshots for UI changes
- Keep documentation clear and concise

## 🔍 Code Review Process

### For Contributors
- Ensure all tests pass
- Follow the code style guidelines
- Include clear commit messages
- Respond to review feedback promptly

### For Reviewers
- Be constructive and helpful
- Focus on code quality and maintainability
- Check for accessibility compliance
- Verify tests cover new functionality

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `documentation` - Improvements to documentation
- `accessibility` - Accessibility improvements
- `performance` - Performance improvements

## 🎯 Development Guidelines

### Performance
- Optimize bundle size
- Use lazy loading for routes
- Implement proper caching strategies
- Monitor Core Web Vitals

### Accessibility
- Follow WCAG 2.1 AA guidelines
- Test with screen readers
- Ensure keyboard navigation
- Provide alternative text for images

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📞 Getting Help

- **Questions**: Use [GitHub Discussions](https://github.com/yourusername/english-leap/discussions)
- **Bugs**: Create an [Issue](https://github.com/yourusername/english-leap/issues)
- **Chat**: Join our community chat (link coming soon)

## 🙏 Recognition

Contributors will be:
- Listed in the README.md
- Mentioned in release notes
- Invited to join the core team (for significant contributions)

## 📄 License

By contributing to English Leap, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make English Leap better for learners worldwide! 🌟
