import React from 'react';
import './WelcomeTile.css';
import imagePear from '../assets/pear.png';

class WelcomeTile extends React.Component{
    constructor(props){
        super(props);

        this.state = { orientation: 0 }

        this.rotateImage = this.rotateImage.bind(this);
    }

    rotateImage(event){
        event.preventDefault();
        this.setState({
            orientation: (this.state.orientation - 90)
        });
    }

    render(){
        return (
            <div className="WelcomeTile">
                <img src={imagePear} alt="Pear" onClick={this.rotateImage} style={{transform: `rotate(${this.state.orientation}deg)`}} />
                <h1>New Project!</h1>
                <span>Click the pear to rotate 😝</span>
            </div>
        );
    }
}

export default WelcomeTile;