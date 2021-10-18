export function connectWebSocket() {
    let socket = new WebSocket("wss://free3.piesocket.com/v3/1?api_key=nwtWwdEJfF9Lf3moBHKF0tACtscdGwPo1HF4sIaD&notify_self");

    socket.onopen = function(e) {
      console.info("[open] Connection established");
      console.debug("Sending to server");
      socket.send("PING");
    };
    
    socket.onmessage = function(event) {
      console.debug(`[message] Data received from server: ${event.data}`);
    };
    
    socket.onclose = function(event) {
      if (event.wasClean) {
        console.info(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.error('[close] Connection died');
      }
    };
    
    socket.onerror = function(error) {
      console.error(`[error] ${error.message}`);
    };

    return socket;
}

export function disconnectWebSocket(socket){
    socket.close();
}
