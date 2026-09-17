# LCR Live
A real-time multiplayer Left Right Center web game for 2–20 real players on separate phones/computers.

## Run locally
1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm install`
4. Run `npm start`
5. Open `http://localhost:3000`

## Play on multiple devices over the internet
Deploy this folder to any Node.js host that supports WebSockets (for example Render, Railway, Fly.io, or a VPS). Share the deployed URL. One player creates a room and shares its 4-character room code; everyone else joins with that code.

## Rules implemented
- 3 starting chips per player
- Roll up to 3 dice based on current chip count
- L sends one chip left; R sends one right; C sends one to center; dots keep chips
- Players with zero chips are skipped but can re-enter if they receive a chip
- Last player holding chips wins
