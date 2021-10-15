import React from 'react';
import { withMsal } from '@azure/msal-react';

class MicrosoftConnectTile extends React.Component{

    constructor(props){
        super(props);
    }

    test() {
    }

    render() {
        const msalInstance = this.props.msalContext.instance;
        const msalAccounts = this.props.msalContext.accounts;
        const activeAccount = msalAccounts.length > 0 ? msalAccounts[0] : null;
 
        return (
            <div className="MicrosoftConnectTile">
                <button onClick={() => msalInstance.loginRedirect()}>Connect to Microsoft365</button>
                <button onClick={() => this.test()}>Log Test Data</button>
                { msalAccounts.length > 0 &&
                    <div>
                        <p>
                            <b>Name: </b>{activeAccount.name}<br />
                            <b>Username: </b>{activeAccount.username}<br />
                            <b>Tenant: </b>{activeAccount.tenantId}<br />
                            <b>GUID: </b>{activeAccount.localAccountId}<br />
                        </p>
                        <button onClick={() => { localStorage.clear(); window.location.reload(); }}>Log Out</button>
                    </div>
                }
            </div>
        );
    }
}

export default withMsal(MicrosoftConnectTile);;