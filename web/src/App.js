import React from 'react';
import './App.css';

import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './helpers/MsalHelpers';

import MicrosoftConnectTile from './components/MicrosoftConnectTile';

const pca = new PublicClientApplication(msalConfig);

class App extends React.Component {

  componentDidMount(){
    // This little hack keeps the tab alive
    const audioEl = document.getElementById("audio");
    audioEl.play();
  }

  render() {
    return (
      <div>
        <div className="App" >
          <MsalProvider instance={pca}>
            <MicrosoftConnectTile />
          </MsalProvider>
        </div>
        <audio id="audio" loop={true}>
          <source src="./1-minute-of-silence.mp3"></source>
        </audio>
        <footer>Made by Chris</footer>
      </div>
    );
  }
}

export default App;
