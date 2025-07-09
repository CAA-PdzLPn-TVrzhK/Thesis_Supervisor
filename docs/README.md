# Documentation Overview

This directory contains comprehensive documentation for the Thesis Supervisor System.

## Documentation Structure

### 📋 [Architecture](architecture/)
System architecture documentation including:
- **Static View**: Component diagrams and system structure
- **Dynamic View**: Sequence diagrams and system behavior  
- **Deployment View**: Infrastructure and deployment architecture

### 🔍 [Quality Assurance](quality-assurance/)
Quality documentation based on ISO 25010:
- **User Acceptance Tests**: Comprehensive test scenarios
- **Quality Attribute Scenarios**: Performance, security, and usability tests

### 🛠️ [Development](development/)
Development process documentation:
- **Git Workflow**: Branching strategy and development process
- **Code Standards**: Coding conventions and review process

## Quick Navigation

| Topic | Document | Description |
|-------|----------|-------------|
| Getting Started | [Main README](../README.md#usage) | How to run and use the system |
| Architecture Overview | [Architecture](architecture/README.md) | System design and structure |
| Testing Strategy | [Quality Assurance](quality-assurance/README.md) | Testing approach and quality goals |
| Development Setup | [Development](development/README.md) | Development environment and workflow |

## Diagram Generation

### PlantUML Diagrams
```bash
# Generate all architecture diagrams
plantuml docs/architecture/**/*.puml
```

### Mermaid Diagrams  
```bash
# Generate git workflow diagram
mmdc -i docs/development/git-workflow.mmd -o docs/development/git-workflow.png
```

## Documentation Standards

- All documentation follows Markdown format
- Diagrams use PlantUML or Mermaid syntax
- Architecture follows C4 model principles
- Quality scenarios follow ISO 25010 standard
- Development process based on GitHub Flow

## Contributing to Documentation

1. **Architecture Changes**: Update relevant diagrams and documentation
2. **Quality Updates**: Ensure tests reflect current requirements  
3. **Process Changes**: Update development documentation accordingly
4. **Review Process**: All documentation changes require peer review

For questions or suggestions, please create an issue or contact the development team. 