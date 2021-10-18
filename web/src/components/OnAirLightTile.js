import './OnAirLightTile.css';
import React from 'react';
import { getBoardStatus, setLedBoardColour } from '../helpers/LedBoardHelpers';
import monitoringImage from '../assets/monitoring.gif';

class OnAirLightTile extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            boardConnected: false,
            connectionInProgress: false,
            ipAddress: ''
        };
        this.testBoardConnection = this.testBoardConnection.bind(this);
        this.ipAddressUpdated = this.ipAddressUpdated.bind(this);
        this.disconnectBoard = this.disconnectBoard.bind(this);
    }

    componentDidMount() {
        const lastIpAddress = localStorage.getItem('ipAddressPreviousValue') ?? '';
        this.setState({ ipAddress: lastIpAddress });
    }

    ipAddressUpdated(event){
        this.setState({ ipAddress: event.target.value });
    }

    async testBoardConnection(event) {
        this.setState({connectionInProgress: true});
        event.preventDefault();
        // Get board status
        const status = await getBoardStatus(this.state.ipAddress);
        this.setState({ boardConnected: status, connectionInProgress: false });

        if (status) { 
            this.props.updateBoardIpAddress(this.state.ipAddress);
            localStorage.setItem('ipAddressPreviousValue', this.state.ipAddress);
        }
    }

    disconnectBoard(event){
        event.preventDefault();
        setLedBoardColour(this.state.ipAddress, 0, 0, 0);
        this.setState({ boardConnected: false });
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
                                Connected to light at {this.state.ipAddress} <button onClick={this.disconnectBoard}>Disconnect</button>
                            </div>
                        
                        }
                        { !this.state.boardConnected &&
                            <form>
                                <label htmlFor='ip-address' >Enter IP address of the On-Air light: </label>
                                <input value={this.state.ipAddress} onChange={this.ipAddressUpdated} type='text' name='ip-address' id='ip-address' />
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