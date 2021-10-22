import './MicrosoftConnectTile.css';
import React from 'react';
import { withMsal } from '@azure/msal-react';

import UserInfo from './UserInfo';
import OnAirLightTile from './OnAirLightTile';

class MicrosoftConnectTile extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            boardDeviceName: undefined,
            socket: undefined
        };

        this.updateBoardDeviceName = this.updateBoardDeviceName.bind(this);
        this.updateSocket = this.updateSocket.bind(this);
    }

    login = () => this.props.msalContext.instance.loginRedirect();

    logout = () => {
        localStorage.clear(); 
        window.location.reload();
    }

    updateBoardDeviceName(deviceName) {
        this.setState({
            boardDeviceName: deviceName
        });
    }

    updateSocket(socket){
        this.setState({
            socket: socket
        });
    }

    render() {
        const msalAccounts = this.props.msalContext.accounts;
        const activeAccount = msalAccounts.length > 0 ? msalAccounts[0] : null;
        return (
            <div>
                <div className={`MicrosoftConnectTile ${ activeAccount != null ? "ConnectTileActive" : "" }`}>

                    { msalAccounts.length === 0 &&
                        <button onClick={() => this.login()}>Connect to Microsoft365</button>
                    }

                    { msalAccounts.length > 0 &&
                        <div>
                            <UserInfo user={activeAccount} boardDeviceName={this.state.boardDeviceName} socket={this.state.socket} />
                            <button onClick={() => this.logout()}>Disconnect</button>
                        </div>
                    }
                </div>
                <div className={activeAccount == null ? 'faded' : 'active'}>⬇</div>
                <OnAirLightTile authenticatedWithMicrosoft={activeAccount != null} updateBoardDeviceName={this.updateBoardDeviceName} updateSocket={this.updateSocket}/>
          </div>
        );
    }
}

export default withMsal(MicrosoftConnectTile);
export const UnwrappedMicrosoftConnectTile = MicrosoftConnectTile;