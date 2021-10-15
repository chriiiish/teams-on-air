import React from 'react';
import { withMsal } from '@azure/msal-react';

import UserInfo from './UserInfo';

class MicrosoftConnectTile extends React.Component{

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

                { msalAccounts.length === 0 &&
                    <button onClick={() => this.login()}>Connect to Microsoft365</button>
                }

                { msalAccounts.length > 0 &&
                    <div>
                        <UserInfo user={activeAccount} />
                        <button onClick={() => this.logout()}>Logout</button>
                    </div>
                }
            </div>
        );
    }
}

export default withMsal(MicrosoftConnectTile);;