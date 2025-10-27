

export function createSocket(url?: string) {
  const wsUrl = url || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;
  const socket = new WebSocket(wsUrl);

  socket.addEventListener('open', () => {
    console.info('WebSocket connected', wsUrl);
  });

  socket.addEventListener('message', (ev) => {
    try {
      const data = JSON.parse(ev.data);
     
      window.dispatchEvent(new CustomEvent('ws:message', { detail: data }));
    } catch (e) {
     
      window.dispatchEvent(new CustomEvent('ws:message', { detail: ev.data }));
    }
  });

  socket.addEventListener('close', (ev) => {
    console.info('WebSocket closed', ev.code, ev.reason);
  });

  socket.addEventListener('error', (err) => {
    console.warn('WebSocket error', err);
  });

  return socket;
}

export default createSocket;
