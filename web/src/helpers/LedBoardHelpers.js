// Connect to the API websocket
export async function connectToSocket(onErrorCallback){
    const apiDomainName = (window.location.hostname === "localhost") ? 'api.on-air.cjl.nz' : `api.${window.location.hostname}`;
    const ws = new WebSocket(`wss://${apiDomainName}`);
    
    ws.onerror = (error) => {
        console.error(`Websocket Error:`);
        console.error(error);
        onErrorCallback(error);
    };

    ws.onclose = (data) => {
        console.info(`Websocket Disconnected:`);
        console.info(data);
    };

    ws.onopen = (data) => {
        console.info(`Websocket Connected: ${apiDomainName}`);
        console.info(data);
    };

    ws.onmessage = (data) => {
        console.debug(`Websocket Message Received:`);
        console.debug(data);
    };

    const checkState = function(ws, resolve) {
        if (ws.readyState !== ws.OPEN) {
            setTimeout(checkState.bind(this, ws, resolve), 30);
        } else {
            console.log('Connection succeeded');
            resolve(true);
        }
    };

    await new Promise((resolve, reject) => {
        checkState(ws, resolve);
    });

    return ws;
}

// Send the colours through to the physical light
export function setLedBoardColour(socket, deviceName, red, green, blue) {
    socket.send(JSON.stringify({
        action: "update-light",
        data: {
           id: deviceName,
           red: red,
           green: green,
           blue: blue
        }
    }));
};

// Disconnect from the websocket
export function disconnectWebSocket(socket){
    socket.close();
}

// Send a keep-alive packet to the API
export function sendKeepAlive(socket){
    socket.send(JSON.stringify({ 
        action: "ping", 
        data: "keep-alive" 
    }));
}