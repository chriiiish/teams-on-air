import './OnAirLightTile.css';
import React from 'react';
import { connectToSocket, disconnectWebSocket, setLedBoardColour, sendKeepAlive } from '../helpers/LedBoardHelpers';
import monitoringImage from '../assets/monitoring.gif';

class OnAirLightTile extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            boardConnected: false,
            connectionInProgress: false,
            deviceName: '',
            socket: undefined,
            socketPingInterval: undefined
        };
        this.testBoardConnection = this.testBoardConnection.bind(this);
        this.deviceNameUpdated = this.deviceNameUpdated.bind(this);
        this.disconnectBoard = this.disconnectBoard.bind(this);
        this.keepAlive = this.keepAlive.bind(this);
        this.connectionError = this.connectionError.bind(this);
    }

    componentDidMount() {
        const lastdeviceName = localStorage.getItem('deviceNamePreviousValue') ?? '';
        this.setState({ deviceName: lastdeviceName });
    }

    deviceNameUpdated(event){
        this.setState({ deviceName: event.target.value });
    }

    async testBoardConnection(event) {
        event.preventDefault();
        
        this.setState({connectionInProgress: true});

        const socket = await connectToSocket(this.connectionError);
        this.props.updateSocket(socket);
        this.props.updateBoardDeviceName(this.state.deviceName);

        localStorage.setItem('deviceNamePreviousValue', this.state.deviceName);

        const interval = setInterval(this.keepAlive, 5000);
        this.setState({ socket: socket, socketPingInterval: interval });
        this.setState({ boardConnected: true, connectionInProgress: false });
    }

    connectionError(err) {
        console.error("Socket Connection Error");
        console.error(err);
    }

    disconnectBoard(event){
        event.preventDefault();
        setLedBoardColour(this.state.socket, this.state.deviceName, 0, 0, 0);
        this.setState({ boardConnected: false });
        this.props.updateBoardDeviceName(undefined);

        clearInterval(this.state.socketPingInterval);
        disconnectWebSocket(this.state.socket);
        this.setState({socket: undefined, socketPingInterval: undefined});
        this.props.updateSocket(undefined);
    }

    keepAlive(){
        sendKeepAlive(this.state.socket);
    }

    render() {
        let highLevelClasses = 'OnAirLightTile';
        if (this.props.authenticatedWithMicrosoft === false){ highLevelClasses += ' faded'; };
        if (this.state.boardConnected) { highLevelClasses += ' OnAirLightActive'; };
        return (
            <div className={highLevelClasses}>
                { !this.props.authenticatedWithMicrosoft && 
                    <span className="faded">Connect to Microsoft365 before connecting the On-Air light</span>
                }
                { this.props.authenticatedWithMicrosoft &&
                    <div>
                        { this.state.boardConnected &&
                            <div>
                                Connected to light '{this.state.deviceName}' <button onClick={this.disconnectBoard}>Disconnect</button>
                            </div>
                        
                        }
                        { !this.state.boardConnected &&
                            <form>
                                <label htmlFor='device-name' >Enter Device Name of the On-Air light: </label>
                                <input value={this.state.deviceName} onChange={this.deviceNameUpdated} type='text' name='device-name' id='device-name' />
                                <button onClick={this.testBoardConnection} className={this.state.connectionInProgress ? 'hidden' : ''}>Test Connection</button>
                                <img src={monitoringImage} alt='Attempting to connect' className={this.state.connectionInProgress ? 'loading' : 'hidden'} /> 
                            </form>
                        }   
                    </div>
                }
            </div>
        );
    }
}

export default OnAirLightTile;