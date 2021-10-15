import React from 'react';
import './App.css';

import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './helpers/MsalHelpers';

import MicrosoftConnectTile from './components/MicrosoftConnectTile';

const pca = new PublicClientApplication(msalConfig);

class App extends React.Component {
  render() {
    return (
      <div>
        <div className="App" >
          <MsalProvider instance={pca}>
            <MicrosoftConnectTile />
          </MsalProvider>
        </div>
        <footer>Made by Chris</footer>
      </div>
    );
  }
}

export default App;
