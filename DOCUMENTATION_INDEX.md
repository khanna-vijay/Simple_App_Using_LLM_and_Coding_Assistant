# English Leap - Documentation Index

This document provides an overview of all documentation and resources available in this repository.

## 📚 Main Documentation

### Getting Started
- **[README.md](README.md)** - Project overview, features, and quick start guide
- **[SETUP.md](SETUP.md)** - Detailed development setup and configuration
- **[QUICK_START_GUIDE.md](docs/user/QUICK_START_GUIDE.md)** - User guide for learning with English Leap

### Project Management
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to the project
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes
- **[SECURITY.md](SECURITY.md)** - Security policy and vulnerability reporting

## 🏗️ Architecture & Design

### Architecture Documentation
- **[Architecture Vision](docs/architecture/zachman/architecture_vision.md)** - Overall architectural principles and vision
- **[Enterprise Architecture](docs/architecture/zachman/enterprise_architecture.md)** - Enterprise-level architectural considerations
- **[Software Architecture Document](docs/architecture/software_architecture_document.md)** - Detailed technical architecture

### C4 Architecture Diagrams
- **[C4 Context](docs/architecture/C4/C4-context.puml)** - System context diagram
- **[C4 Container](docs/architecture/C4/C4-container.puml)** - Container-level architecture
- **[C4 Component](docs/architecture/C4/C4-component.puml)** - Component relationships
- **[C4 Deployment](docs/architecture/C4/C4-deployment.puml)** - Deployment architecture
- **[C4 Environment](docs/architecture/C4/C4-environment.puml)** - Environment setup
- **[C4 Flow](docs/architecture/C4/C4-flow.puml)** - User interaction flows

### Architecture Decision Records (ADRs)
- **[ADR-001](docs/adr/001-initial-architecture-decision.md)** - Initial architecture decisions

## 📋 Project Planning

### Requirements & Specifications
- **[Vision & Charter](docs/project/VISION_AND_CHARTER.md)** - Project vision, scope, and objectives
- **[System Requirements](docs/project/SYSTEM_REQUIREMENTS_SPECIFICATION.md)** - Functional and non-functional requirements
- **[Data Source Inventory](docs/project/DATA_SOURCE_INVENTORY.md)** - Data sources and management
- **[Risks & Assumptions](docs/project/RISKS_AND_ASSUMPTIONS_LOG.md)** - Risk management and assumptions
- **[Roadmap](docs/project/ROADMAP.md)** - Development roadmap and milestones

### Backlog & User Stories
- **[User Story Backlog](backlog/user_story_backlog.md)** - Complete user stories with acceptance criteria
- **[Community Backlog](backlog/community_backlog.md)** - Community-driven feature requests
- **[Sprint Backlog](backlog/detailed_design_and_planning/sprint_backlog.md)** - Current sprint planning

## 🗄️ Data & API

### Database Design
- **[Database Schema](docs/database/db_schema.sql)** - Complete database schema with tables and relationships
- **[ER Diagram](docs/database/er_diagram.png)** - Entity relationship diagram

### API Specification
- **[OpenAPI Specification](api/openapi.yaml)** - Complete API documentation in OpenAPI 3.0 format

## 🛠️ Development Resources

### Build & Deployment Scripts
- **[Build Script](scripts/build.sh)** - Production build script with optimization
- **[Deploy Script](scripts/deploy.sh)** - Automated deployment to GitHub Pages

### Quality Assurance
- **[Integration Test Matrix](quality/integration_test_matrix.md)** - Testing strategy and coverage
- **[Performance Test Report](quality/performance_test_report.md)** - Performance benchmarks
- **[Quality Attribute Scenarios](quality/quality_attribute_scenarios.md)** - Quality requirements
- **[Security Review & SBOM](quality/security_review_and_sbom.md)** - Security analysis

### Release Management
- **[Release Checklist](release/RELEASE_CHECKLIST.md)** - Pre-release verification steps

## 📊 Governance & Compliance

### Project Governance
- **[Governance Framework](docs/governance/GOVERNANCE.md)** - Project governance structure and processes
- **[Security Policy](docs/governance/SECURITY.md)** - Security guidelines and compliance

### Monitoring & Analytics
- **[Telemetry](telemetry/TELEMETRY.md)** - Analytics and monitoring strategy

## 🎯 User Resources

### User Documentation
- **[User Guide](docs/user/USER_GUIDE.md)** - Comprehensive user manual
- **[Quick Start Guide](docs/user/QUICK_START_GUIDE.md)** - Getting started tutorial

## 🔧 Configuration Files

### Development Configuration
- **[package.json](package.json)** - Project dependencies and scripts
- **[.env.example](.env.example)** - Environment variables template
- **[.eslintrc.js](.eslintrc.js)** - Code linting configuration
- **[.prettierrc](.prettierrc)** - Code formatting configuration
- **[.gitignore](.gitignore)** - Git ignore rules

### GitHub Configuration
- **[CI/CD Pipeline](.github/workflows/ci.yml)** - Automated testing and deployment
- **[Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)** - Issue reporting template
- **[Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)** - Feature request template
- **[Pull Request Template](.github/pull_request_template.md)** - PR submission template

## 📱 Application Structure

### Source Code Organization
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── common/         # Common components
│   ├── layout/         # Layout components
│   └── auth/           # Authentication components
├── pages/              # Main page components
├── context/            # React context providers
├── services/           # Business logic and APIs
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── theme/              # Material-UI theme configuration
```

### Public Assets
```
public/
├── audio/              # Pronunciation audio files
├── data/               # Dictionary and vocabulary data
├── favicon.jpg         # Application icon
└── manifest.json       # PWA manifest
```

## 🚀 Quick Navigation

### For Developers
1. Start with [SETUP.md](SETUP.md) for development environment
2. Review [Architecture Vision](docs/architecture/zachman/architecture_vision.md) for technical overview
3. Check [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
4. Use [User Story Backlog](backlog/user_story_backlog.md) for feature development

### For Project Managers
1. Review [Vision & Charter](docs/project/VISION_AND_CHARTER.md) for project scope
2. Check [System Requirements](docs/project/SYSTEM_REQUIREMENTS_SPECIFICATION.md) for specifications
3. Monitor [Roadmap](docs/project/ROADMAP.md) for milestones
4. Use [Governance Framework](docs/governance/GOVERNANCE.md) for processes

### For Users
1. Start with [Quick Start Guide](docs/user/QUICK_START_GUIDE.md)
2. Reference [User Guide](docs/user/USER_GUIDE.md) for detailed instructions
3. Report issues using [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)
4. Request features using [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)

### For Architects
1. Review [C4 Architecture Diagrams](docs/architecture/C4/) for system design
2. Check [Database Schema](docs/database/db_schema.sql) for data model
3. Reference [API Specification](api/openapi.yaml) for interface design
4. Review [ADRs](docs/adr/) for architectural decisions

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/yourusername/english-leap/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/english-leap/discussions)
- **Security**: [Security Policy](SECURITY.md)
- **Contributing**: [Contributing Guide](CONTRIBUTING.md)

---

**Last Updated**: January 2025  
**Version**: 1.0.0

For the most up-to-date information, always refer to the latest version of this repository.
