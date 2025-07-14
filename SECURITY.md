# Security Policy

## Supported Versions

We actively support the following versions of English Leap with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of English Leap seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Create a Public Issue

Please **do not** create a public GitHub issue for security vulnerabilities. This helps protect users while we work on a fix.

### 2. Report Privately

Send an email to **security@englishleap.com** with:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes (if you have them)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies based on severity (typically 30-90 days)

### 4. Disclosure Process

1. We'll acknowledge receipt of your report
2. We'll investigate and validate the vulnerability
3. We'll develop and test a fix
4. We'll release the fix and notify users
5. We'll publicly acknowledge your contribution (if desired)

## Security Measures

### Client-Side Security

English Leap implements several security measures:

- **Local Data Storage**: All user data stored locally in browser
- **No External Data Transmission**: User progress never sent to external servers
- **Input Sanitization**: All user inputs are sanitized and validated
- **Content Security Policy**: XSS protection headers implemented
- **HTTPS Only**: All external resources loaded over HTTPS

### Data Privacy

- **Minimal Data Collection**: Only essential data for functionality
- **No Personal Information**: No collection of personal identifiable information
- **Local Storage Only**: All data remains on user's device
- **Data Portability**: Users can export/import their data

### Dependencies

- **Regular Updates**: Dependencies updated regularly for security patches
- **Vulnerability Scanning**: Automated scanning for known vulnerabilities
- **Minimal Dependencies**: Only essential packages included
- **Trusted Sources**: All dependencies from verified npm packages

## Security Best Practices for Users

### Browser Security
- Keep your browser updated to the latest version
- Enable automatic security updates
- Use reputable browsers (Chrome, Firefox, Safari, Edge)

### Data Protection
- Regularly backup your learning progress
- Be cautious when using public computers
- Clear browser data when using shared devices

### Reporting Issues
- Report any suspicious behavior immediately
- Don't share personal information in bug reports
- Use official channels for support requests

## Security Features

### Current Implementation
- ✅ Client-side data storage only
- ✅ Input validation and sanitization
- ✅ HTTPS for all external resources
- ✅ Content Security Policy headers
- ✅ No external data transmission
- ✅ Regular dependency updates

### Planned Enhancements
- 🔄 Enhanced data encryption for local storage
- 🔄 Additional security headers
- 🔄 Automated security testing in CI/CD
- 🔄 Security audit logging

## Vulnerability Categories

### High Priority
- Remote code execution
- Cross-site scripting (XSS)
- Data exposure vulnerabilities
- Authentication bypass

### Medium Priority
- Cross-site request forgery (CSRF)
- Information disclosure
- Denial of service (DoS)
- Privilege escalation

### Low Priority
- UI/UX security issues
- Non-exploitable information leaks
- Rate limiting issues

## Security Contact

- **Email**: security@englishleap.com
- **PGP Key**: Available upon request
- **Response Time**: 48 hours maximum

## Acknowledgments

We appreciate security researchers who help keep English Leap safe:

- [Your name could be here!]

## Legal

This security policy is subject to our [Terms of Service](TERMS.md) and [Privacy Policy](PRIVACY.md).

---

Thank you for helping keep English Leap secure! 🔒
