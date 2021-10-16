import React from 'react';
import { withMsal } from '@azure/msal-react';
import { loginRequest, graphConfig } from '../helpers/MsalHelpers';
import { callMsGraph } from '../helpers/MsGraphHelpers';

class UserInfo extends React.Component{

    refreshInterval;

    constructor(props){
        super(props);

        this.state = {
            currentAvailability: undefined,
            currentActivity: undefined
        };

        this.getUserPresenceData = this.getUserPresenceData.bind(this);
        this.setPresenceInformation = this.setPresenceInformation.bind(this);
    }

    componentDidMount(){
        this.refreshInterval = setInterval(this.getUserPresenceData, 1000);
    }

    getUserPresenceData(){
        callMsGraph(this.props.msalContext, graphConfig.presenceEndpoint, this.setPresenceInformation)
    }

    setPresenceInformation(response){
        this.setState({
            currentAvailability: response.availability,
            currentActivity: response.activity,
        });
    }

    render() {
        const user = this.props.user;
        return (
            <div className="UserInfo">
                <p>
                    <b>Name: </b><span>{user.name}</span> (<span>{user.username}</span>)<br />
                    <b>ID: </b><span>{user.localAccountId}</span><br />
                    <b>Current Status: </b><span>{this.state.currentAvailability == undefined ? 'Checking...' : this.state.currentAvailability}</span><br />
                    <b>Current Activity: </b><span>{this.state.currentActivity == undefined ? 'Checking...' : this.state.currentActivity}</span><br />
                </p>
            </div>
        );
    }
}

export default withMsal(UserInfo);
export const UnwrappedUserInfo = UserInfo;