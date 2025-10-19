import WebSocket, { WebSocketServer } from 'ws';

// Simple WebSocket server helper. Attach to an existing HTTP server.
export function attachWebsocket(server, options = {}) {
  const wss = new WebSocketServer({ server, path: options.path || '/ws' });

  // Track connected clients
  wss.on('connection', (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', (message) => {
      // Echo or handle incoming messages 
      try {
        const data = JSON.parse(message.toString());
      
        if (data?.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (e) {
        
      }
    });
  });

  // Heartbeat
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 30000);

  // Broadcast helper
  function broadcast(data) {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(text);
    });
  }

  return { wss, broadcast, close: () => { clearInterval(interval); wss.close(); } };
}

export default attachWebsocket;
