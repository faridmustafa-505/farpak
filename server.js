const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

let players = {};
let coins = Array(10).fill(true);

wss.on("connection", ws => {
  
  ws.on("message", message => {
    const data = JSON.parse(message);

    if (data.type === "join") {
      players[data.id] = {
        id: data.id,
        name: data.name,
        color: data.color,
        x: 0, y: 0, z: 5, r: 0
      };

      ws.id = data.id;

      ws.send(JSON.stringify({ type: "init", players, coins }));

      wss.clients.forEach(c => c.send(JSON.stringify({
        type: "playerJoined",
        player: players[data.id]
      })));
    }

    if (data.type === "update") {
      if (players[data.id]) {
        players[data.id].x = data.x;
        players[data.id].y = data.y;
        players[data.id].z = data.z;
        players[data.id].r = data.r;
      }

      wss.clients.forEach(c => {
        if (c !== ws) c.send(message.toString());
      });
    }

    if (data.type === "coin") {
      coins[data.idx] = false;

      wss.clients.forEach(c => c.send(JSON.stringify({
        type: "coin",
        idx: data.idx
      })));
    }
  });

  ws.on("close", () => {
    if (ws.id && players[ws.id]) {
      delete players[ws.id];
      wss.clients.forEach(c => c.send(JSON.stringify({
        type: "playerLeft",
        id: ws.id
      })));
    }
  });
});

console.log("Server running on ws://localhost:3000");
