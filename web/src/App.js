import React from 'react';
import './App.css';
import WelcomeTile from './components/WelcomeTile';

class App extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div>
        <div className="App" >
          <WelcomeTile />
        </div>
        <footer>Made by Chris</footer>
      </div>
    );
  }
}

export default App;
