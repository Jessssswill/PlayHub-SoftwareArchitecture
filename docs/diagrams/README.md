# Diagram Sources

All Mermaid diagrams are embedded in the Markdown documentation files and render natively on GitHub.

To export PNG for presentations, use one of these methods:

## Option 1: mermaid.live (Recommended, no install)

1. Open https://mermaid.live
2. Copy diagram source from the sections below
3. Click "Export" → PNG or SVG

## Option 2: Mermaid CLI (requires Node.js)

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i architecture-layers.mmd -o architecture-layers.png
```

---

## Diagram Sources

### architecture-layers.mmd

```
graph TD
    A["Presentation Layer — SessionController · GameGateway"]
    B["Business Layer — GameEngineFacade · Proxies · MoveValidationService"]
    C["Domain Layer — GameSession · Games · State Machine · Events"]
    D["Persistence Layer — GameRegistry · InMemoryStorage · TypeOrmStorage"]
    A -->|calls via Proxy| B
    B -->|orchestrates| C
    B -->|reads/writes| D
    C -.->|emits events| B
```

### sequence-make-move.mmd

See full source in `docs/ARCHITECTURE.md`, Section 5 "Sequence Diagram: Make a Move"

### state-machine.mmd

```
stateDiagram-v2
    [*] --> WAITING : createSession()
    WAITING --> IN_PROGRESS : startGame()
    WAITING --> FINISHED : finish()
    IN_PROGRESS --> PAUSED : pause()
    IN_PROGRESS --> FINISHED : finish()
    PAUSED --> IN_PROGRESS : resume()
    PAUSED --> FINISHED : finish()
    FINISHED --> [*]
```

### class-diagram-factory.mmd

```
classDiagram
    class IGameFactory {
        <<interface>>
        +createBoard(): Board
        +createRules(): GameRules
        +createInitialState(ids): GameState
    }
    class TicTacToeFactory
    class ChessFactory
    IGameFactory <|.. TicTacToeFactory
    IGameFactory <|.. ChessFactory
```

---

All inline diagrams (component diagram, UML class diagrams per pattern) can be found in:
- `docs/ARCHITECTURE.md`: system-level diagrams
- `docs/PATTERNS.md`: per-pattern UML class diagrams
