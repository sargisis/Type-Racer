# Type-Racer

Real-time multiplayer typing game.  
Players join through WebSocket, type the same sentence, server broadcasts typing progress and we render a live race UI.

This is early MVP version — but architecture is already scalable.

## Screenshots

### Home Screen
<img src="./frontend/public/screens/home.png" width="700" />

### In-Game
<img src="./frontend/public/screens/game.png" width="700" />

### Results 
<img src="./frontend/public/screens/result.png" width="700" />


---

## ⚙️ Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Backend | **Rust** + **Axum** | fast, async, memory-safe, perfect for real-time servers |
| Realtime | **WebSockets** (tokio broadcast channel) | instant message fan-out to all connected players |
| Frontend | **React + TypeScript** | fast UI iteration, stateful components, stable typing |
| Styling | Inline React styles | fast prototyping, Fortnite-style gradient theme |
| Data IDs | `uuid` package | unique per-tab player identity |

---

## 🧠 How it works (short architecture)

- Each browser tab generates a UUID → this is the player ID  
- When user enters their name → frontend opens WebSocket to Rust  
- Rust keeps a `broadcast::Sender<String>` for sending events to everyone  
- Every typed character → frontend sends `{ id, progress }`  
- When progress hits `100` → frontend sends `{ id, finished:true }`  
- Backend rebroadcasts to all tabs  
- Frontend shows results ranking

---

## 📦 Run Project

### backend

```bash
cd backend
cargo run

Server runs at:
http://127.0.0.1:8080

```
--- 

### frontend 
```bash 
cd frontend
npm install
npm run dev

Open in browser:
http://localhost:5173

```

--- 

## ✅ Current Features

- Multiple players at same time

- Unique identity per tab

- Progress bars live update in real-time

- Finish detection

- Ranking screen with crown/medals

---

## 🚀 Future Development

- Some ideas for future expansion:

- Rooms / Match codes (private lobbies)

- Persistent leaderboard (SQLite / SurrealDB)

- WPM (Words Per Minute) calculation

- Sound effects & animations

- Player avatars / skins

- Mobile responsive UI

--- 

## Why Rust + Axum?

- Because for realtime interaction Rust gives:

- Zero GC pauses

- Safe concurrency

- Predictable performance

- For games like realtime typing → latency matters.

---

## AUTHOR
## SARGIS ABGARYAN