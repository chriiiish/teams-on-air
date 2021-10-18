const timeout = 5000;

export async function setLedBoardColour(deviceName, red, green, blue) {
    const controller = new AbortController();
    const signal = controller.signal;
    const options = {
        method: "POST",
        signal: signal,
        headers: { 'Content-Type': 'application/json', 'x-api-key' : 'ML28G8cQJsCwellSIZfk31ixUVYNlvu1uHi8c7lb' },
        body: JSON.stringify({ 
            state: {
                desired: {
                    red: red,
                    green: green,
                    blue: blue
                }
            }
        })
    };
    setTimeout(() => controller.abort(), timeout);

    const domainName = (window.location.hostname === "localhost") ? 'on-air.cjl.nz' : window.location.hostname

    return fetch(`https://api.${domainName}/shadow/${deviceName}`, options)
        .then(response => response.json())
        .catch(error => console.log(error));
};

export function getBoardStatus(deviceName) {
    return setLedBoardColour(deviceName, 255, 255, 255).then((response) => true).catch((error) => false);
}