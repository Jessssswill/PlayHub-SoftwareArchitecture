# Demo Flow — Game Session Manager

## Prerequisites

```bash
# Terminal 1 — backend
cd backend && npm run start:dev   # http://localhost:3001

# Terminal 2 — frontend
cd frontend && npm run dev         # http://localhost:3000
```

---

## Flow 1: Full TicTacToe Game (2 browser windows)

1. Open **Window A** → `http://localhost:3000`
2. Click **+ New Session** → pick Tic-Tac-Toe, enter "Alice" + "Bob" → Create
3. Copy the game URL (e.g. `/game/<sessionId>`)
4. Open **Window B** → paste the same URL
5. **Window B**: click "Bob" when asked "Who are you?"
6. **Window A**: automatically identified as Alice (creator)
7. Alice clicks a cell → move appears in BOTH windows instantly (WebSocket)
8. Bob clicks a cell → move appears in both windows
9. Play until winner — green banner shows in both windows

**Expected**: No page refresh needed. Both windows stay in sync.

---

## Flow 2: State Persists After Refresh

1. Play 2–3 moves in a session
2. Refresh **Window A** (F5)
3. **Expected**: Board state reloads from backend (GET /sessions). Move history
   reloads from session state. No lost data.

---

## Flow 3: Chess Game

1. Create a new session, pick **Chess**
2. White pieces are at rows 0–1 (top), black at rows 6–7 (bottom)
3. **Window A** (Player 1 / White): click a white piece, then click destination
4. **Window B** (Player 2 / Black): responds
5. Pieces move in real-time across both windows

---

## Flow 4: Demo Endpoint (quick showcase)

1. Click **Demo** button on lobby page
2. Auto-creates a TicTacToe session with "Demo Alice" vs "Demo Bob"
3. 3 moves are pre-played (Alice: 0,0 → Bob: 1,1 → Alice: 0,1)
4. Game page opens with a partially played board

---

## Flow 5: REST API (Swagger)

- Swagger UI: `http://localhost:3001/api/docs`
- All endpoints documented with Indonesian descriptions
- Try POST `/sessions`, POST `/sessions/{id}/move`, etc.

---

## Architecture Patterns Demonstrated

| Screen | Pattern |
|--------|---------|
| Session list (polling) | Facade → REST |
| Board updates (live) | Observer (WebSocket Gateway → Socket.io) |
| Authorization check | Protection Proxy |
| State cache | Caching Proxy |
| Move execution | Template Method (executeTurn) |
| Session creation | Builder + Factory |
| Game state machine | State Pattern |
| Frontend state | Zustand store |
