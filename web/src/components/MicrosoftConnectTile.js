import React from 'react';
import { withMsal } from '@azure/msal-react';

class MicrosoftConnectTile extends React.Component{

    constructor(props){
        super(props);
    }

    login = () => this.props.msalContext.instance.loginRedirect();

    logout = () => {
        localStorage.clear(); 
        window.location.reload();
    }

    render() {
        const msalAccounts = this.props.msalContext.accounts;
        const activeAccount = msalAccounts.length > 0 ? msalAccounts[0] : null;
 
        return (
            <div className="MicrosoftConnectTile">
                <button onClick={() => this.login()}>Connect to Microsoft365</button>
                { msalAccounts.length > 0 &&
                    <div>
                        <p>
                            <b>Name: </b>{activeAccount.name}<br />
                            <b>Username: </b>{activeAccount.username}<br />
                            <b>Tenant: </b>{activeAccount.tenantId}<br />
                            <b>GUID: </b>{activeAccount.localAccountId}<br />
                        </p>
                        <button onClick={() => this.logout()}>Log Out</button>
                    </div>
                }
            </div>
        );
    }
}

export default withMsal(MicrosoftConnectTile);;