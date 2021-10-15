import React from 'react';

class UserInfo extends React.Component{

    render() {
        const user = this.props.user;
        return (
            <div className="UserInfo">
                <p>
                    <b>Name: </b>{user.name}<br />
                    <b>Username: </b>{user.username}<br />
                    <b>Tenant: </b>{user.tenantId}<br />
                    <b>GUID: </b>{user.localAccountId}<br />
                </p>
            </div>
        );
    }
}

export default UserInfo;