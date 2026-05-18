# Architecture Overview

> Placeholder — to be filled after Prompt 2 (domain layer implementation).

## Layered Architecture (Closed Layers)

| Layer | Responsibilities |
|-------|-----------------|
| Presentation | Controllers, WebSocket Gateways, DTOs |
| Business | Services, Domain Entities, Design Patterns |
| Persistence | Repositories, Proxies, Storage Adapters |
| Database | TypeORM Entities, SQLite |

## Dependency Rule

Each layer only imports from the layer directly below it. No skipping. No upward references.
