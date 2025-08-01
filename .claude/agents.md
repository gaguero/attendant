# Claude Agents Configuration

This file defines specialized agents for the Attendant project to leverage Claude Code's best capabilities.

## Architecture Agent
**Type**: architecture-reviewer
**Purpose**: Review and improve system architecture, design patterns, and code structure
**When to use**: After implementing new services, refactoring code, or adding new architectural components
**Focus areas**: 
- Service layer design
- Repository patterns
- Dependency injection
- SOLID principles
- Performance implications

## Testing Agent  
**Type**: test-engineer
**Purpose**: Create comprehensive test suites and review testing strategies
**When to use**: When implementing new features, refactoring existing code, or improving test coverage
**Focus areas**:
- Unit test design
- Integration testing
- Mocking strategies  
- Test data management
- Performance testing

## Security Agent
**Type**: security-auditor
**Purpose**: Review security implementations and identify vulnerabilities
**When to use**: When implementing authentication, authorization, or handling sensitive data
**Focus areas**:
- Authentication flows
- Authorization patterns
- Input validation
- SQL injection prevention
- OWASP compliance

## Performance Agent
**Type**: performance-optimizer
**Purpose**: Analyze and optimize application performance
**When to use**: When implementing caching, database queries, or API endpoints
**Focus areas**:
- Database query optimization
- Caching strategies
- API response times
- Memory usage
- Scalability concerns

## API Agent
**Type**: api-designer
**Purpose**: Design and review RESTful API implementations
**When to use**: When creating new endpoints or refactoring existing APIs
**Focus areas**:
- REST principles
- Response structure consistency
- Error handling
- Documentation
- Versioning strategy

## Database Agent
**Type**: database-architect
**Purpose**: Review database schema design and query optimization
**When to use**: When modifying Prisma schema or optimizing database operations
**Focus areas**:
- Schema normalization
- Index optimization
- Query performance
- Migration strategies
- Data integrity

## Frontend Agent
**Type**: frontend-architect
**Purpose**: Review React components and frontend architecture
**When to use**: When implementing UI components or improving frontend performance
**Focus areas**:
- Component design patterns
- State management
- Performance optimization
- Accessibility compliance
- Responsive design