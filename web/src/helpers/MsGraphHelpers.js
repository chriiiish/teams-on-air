import { loginRequest } from "./MsalHelpers";

export async function callMsGraph(msalContext, endpoint, callback) {
    const instance = msalContext.instance;
    const accounts = msalContext.accounts;

    const callGraph = (response) => {
        const headers = new Headers();
        const bearer = `Bearer ${response.accessToken}`;

        headers.append("Authorization", bearer);

        const options = {
            method: "GET",
            headers: headers
        };

        return fetch(endpoint, options)
            .then(response => response.json())
            .catch(error => console.log(error))
            .then(response => callback(response));
    };

    instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
    }).then(callGraph)
    .catch((e) => {
        console.error("Microsoft Graph error:");
        console.error(e);
        instance.acquireTokenRedirect(loginRequest)
        .then(callGraph);
    });
}