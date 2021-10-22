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

    await new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("TIMEOUT");
            if(ws.readyState !== ws.OPEN){
                reject(false);
            } else {
                resolve(true);
            }
        }, 1000);
    });

    console.log("RETURNING");
    return ws;
}

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

export function disconnectWebSocket(socket){
    socket.close();
}

export function sendKeepAlive(socket){
    socket.send(JSON.stringify({ 
        action: "ping", 
        data: "keep-alive" 
    }));
}