const timeout = 5000;

export async function setLedBoardColour(ipAddress, red, green, blue) {
    const controller = new AbortController();
    const signal = controller.signal;
    const options = {
        method: "POST",
        signal: signal
    };
    setTimeout(() => controller.abort(), timeout);

    return fetch(`http://${ipAddress}/leds?red=${red}&green=${green}&blue=${blue}`, options)
        .then(response => response.json())
        .catch(error => console.log(error));
};

export function getBoardStatus(ipAddress) {
    const controller = new AbortController();
    const signal = controller.signal;
    setTimeout(() => controller.abort(), timeout);

    return fetch(`http://${ipAddress}/alive`, { method: "GET", signal: signal })
        .then((response) => response.json())
        .then((responseJson) => responseJson.status === 'online')
        .catch((error) => false);
}