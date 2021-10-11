export function generateQrData(name, description) {
    // Format for NZ Covid Tracer App
    const dataObject = {
        "gln": "00000000",
        "ver": "c19:1",
        "typ": "entry",
        "opn": name,
        "adr": description
    };

    // Now base64 encode it
    const buffer = new Buffer(JSON.stringify(dataObject));
    const base64Object = buffer.toString('base64');

    // Finally add the NZCOVIDTRACER tag
    return `NZCOVIDTRACER:${base64Object}`;
}