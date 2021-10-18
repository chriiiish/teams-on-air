import './UserInfo.css';
import React from 'react';
import { withMsal } from '@azure/msal-react';
import { graphConfig } from '../helpers/MsalHelpers';
import { callMsGraph } from '../helpers/MsGraphHelpers';
import { setLedBoardColour } from '../helpers/LedBoardHelpers';
import monitoringImage from '../assets/monitoring.gif';
import errorImage from '../assets/error.png';

class UserInfo extends React.Component{

    refreshInterval; // Refreshes Teams Status
    problemTimeout; // Dead man switch - if we haven't heard anything back from microsoft show error

    constructor(props){
        super(props);

        this.state = {
            currentAvailability: undefined,
            currentActivity: undefined,
            monitoringMessage: 'Connecting...',
            monitoringStatusIcon: monitoringImage,
            previousAvailability: undefined,
            previousActivity: undefined,
            previousDeviceName: undefined
        };

        this.getUserPresenceData = this.getUserPresenceData.bind(this);
        this.setPresenceInformation = this.setPresenceInformation.bind(this);
        this.noMessageReceived = this.noMessageReceived.bind(this);
    }

    componentDidMount(){
        this.refreshInterval = setInterval(this.getUserPresenceData, 1000);
        this.problemTimeout = setTimeout(this.noMessageReceived, 4000);
    }

    getUserPresenceData(){
        callMsGraph(this.props.msalContext, graphConfig.presenceEndpoint, this.setPresenceInformation);
    }

    setPresenceInformation(response){
        this.setState({
            currentAvailability: response.availability,
            currentActivity: response.activity,
            monitoringMessage: 'Monitoring status...',
            monitoringStatusIcon: monitoringImage
        });
        clearTimeout(this.problemTimeout);
        this.problemTimeout = setInterval(this.noMessageReceived, 4000);

        if(this.props.boardDeviceName){
            if (this.state.currentActivity !== this.state.previousActivity || 
                this.state.currentAvailability !== this.state.previousAvailability ||
                this.props.boardDeviceName !== this.state.previousDeviceName
                ){

                this.setState({
                    previousActivity: this.state.currentActivity,
                    previousAvailability: this.state.currentAvailability,
                    previousDeviceName: this.props.boardDeviceName
                });

                switch(this.state.currentAvailability){
                    case 'Busy':
                        if (this.state.currentActivity === 'InACall') setLedBoardColour(this.props.boardDeviceName, 255, 0, 0);
                        else setLedBoardColour(this.props.boardDeviceName, 0, 255, 0);
                        break;
                    case 'Available':
                        setLedBoardColour(this.props.boardDeviceName, 0, 255, 0);
                        break;
                    case 'Offline':
                        setLedBoardColour(this.props.boardDeviceName, 0, 0, 0)
                        break;
                    default:
                        setLedBoardColour(this.props.boardDeviceName, 0, 255, 0);
                        break;
                }
            }
        }

    }

    noMessageReceived(){
        this.setState({ monitoringMessage: 'Error', monitoringStatusIcon: errorImage });
    }

    render() {
        const user = this.props.user;
        return (
            <div className="UserInfo">
                <table>
                    <tbody>
                        <tr><td className="info-label">Name:</td><td><span>{user.name}</span> (<span>{user.username}</span>)</td></tr>
                        <tr><td className="info-label">ID:</td><td><span>{user.localAccountId}</span></td></tr>
                        <tr><td className="info-label">Current Status:</td><td>{this.state.currentAvailability === undefined ? 'Checking...' : this.state.currentAvailability}</td></tr>
                        <tr><td className="info-label">Current Activity:</td><td>{this.state.currentActivity === undefined ? 'Checking...' : this.state.currentActivity}</td></tr>
                    </tbody>
                </table>
                <div className="monitoring">
                    { this.state.monitoringMessage !== 'Error' && 
                        <img src={monitoringImage} alt={this.state.monitoringMessage} />
                    }
                    { this.state.monitoringMessage === 'Error' &&
                        <img src={errorImage} alt={this.state.monitoringMessage} />
                    }
                    <br /><span>{this.state.monitoringMessage}</span><br /><br />
                </div>
                
            </div>
        );
    }
}

export default withMsal(UserInfo);
export const UnwrappedUserInfo = UserInfo;