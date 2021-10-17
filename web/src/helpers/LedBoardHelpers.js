export async function setLedBoardColour(red, green, blue) {
    const options = {
        method: "POST"
    };

    return fetch(`http://192.168.1.71/leds?red=${red}&green=${green}&blue=${blue}`, options)
        .then(response => response.json())
        .catch(error => console.log(error));
};