# Architecture Documentation

This directory contains architectural diagrams and documentation for the Thesis Supervisor System.

## Directory Structure

- **`static-view/`** - Component diagrams showing system structure
- **`dynamic-view/`** - Sequence diagrams showing system behavior
- **`deployment-view/`** - Deployment diagrams showing system deployment

## Diagram Generation

### PlantUML Diagrams

To generate PNG images from PlantUML source files:

```bash
# Install PlantUML (requires Java)
# On macOS: brew install plantuml
# On Ubuntu: sudo apt-get install plantuml

# Generate all diagrams
plantuml docs/architecture/**/*.puml

# Generate specific diagram
plantuml docs/architecture/static-view/component-diagram.puml
```

### Mermaid Diagrams

For Mermaid diagrams (like git-workflow.mmd):

```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Generate diagram
mmdc -i docs/development/git-workflow.mmd -o docs/development/git-workflow.png
```

## Architecture Overview

The system follows a **layered architecture** pattern with clear separation of concerns:

1. **Presentation Layer**: User interfaces (Web, Telegram)
2. **API Layer**: REST APIs and Bot integration
3. **Domain Layer**: Business logic and entities
4. **Infrastructure Layer**: Data access and external services

This architecture ensures:
- **High cohesion** within each layer
- **Low coupling** between layers
- **Easy testability** through dependency injection
- **Maintainability** through clear boundaries 