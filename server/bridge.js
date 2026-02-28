const WebSocket = require("ws");
const osc = require("osc");

// WebSocket server (from browser)
const wss = new WebSocket.Server({ port: 8081 });

// OSC UDP (to SuperCollider)
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,
  remoteAddress: "127.0.0.1",
  remotePort: 57120
});

udpPort.open();

wss.on("connection", (ws) => {
  console.log("🟢 Browser connected");

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);

      udpPort.send({
        address: "/control",
        args: [
          { type: "f", value: msg.density },
          { type: "f", value: msg.energy }
        ]
      });

    } catch (e) {
      console.error("Invalid message", e);
    }
  });
});

console.log("🟣 WebSocket listening on ws://localhost:8081");
