# ISO/IEC 25010 Quality Attributes Justification

> Placeholder — to be filled after architecture is complete.

## Target Quality Attributes

- **Maintainability** — Modularity via closed layers; patterns isolate concerns.
- **Modifiability** — Open/Closed: adding a new game type requires only a new Factory, no changes to existing code.
- **Testability** — DI + interfaces + closed layers allow each unit to be tested in isolation.
- **Reliability** — State pattern enforces valid game lifecycle transitions; no invalid state reachable.
