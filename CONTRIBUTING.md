# Contributing to Smart Irrigation IoT System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Workflow

1. **Fork the repository**
2. **Create a feature branch** from `develop`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write tests** for your changes
5. **Run tests locally**
   ```bash
   npm test
   npm run lint
   ```
6. **Commit your changes** following commit message conventions
7. **Push to your fork**
8. **Create a Pull Request** to the `develop` branch

## Commit Message Convention

We follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(sensor-service): add data validation for soil moisture readings

fix(irrigation-service): correct water demand calculation for rice crops

docs(readme): update deployment instructions for Kubernetes
```

## Code Style

- Follow TypeScript best practices
- Use ESLint configuration provided
- Format code with Prettier
- Write meaningful variable and function names
- Add comments for complex logic

## Testing Requirements

- Write unit tests for all new functions
- Maintain test coverage above 80%
- Write integration tests for API endpoints
- Property-based tests for critical algorithms

## Pull Request Process

1. Update README.md with details of changes if needed
2. Update documentation for API changes
3. Ensure all tests pass
4. Request review from at least one maintainer
5. Address review comments
6. Squash commits if requested

## Questions?

Feel free to open an issue for questions or discussions.
