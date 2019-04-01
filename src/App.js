import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';

// This is the loopback service provided by resourcemanagement.gkb.training-cns-edge project
const RestApiRoot = 'http://ec2-35-171-225-11.compute-1.amazonaws.com:3000/api/CoffeeMuggers';

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to Coffee Mugger</h1>
                </header>

                <CurrentStatus />

                <MyButton/>

                <QuenchButton/>
            </div>
        )
    }
}

class CurrentStatus extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            className : '',
            date : new Date()
        };
    }

    componentDidMount(){
        this.timerID = setInterval(() => this.tick(), 5000);
    }

    componentWillUnmount(){
        clearInterval(this.timerID);
    }

    render() {
        return (<div><p><button className={this.state.className}>
            Current Status as of {this.state.date.toLocaleTimeString()} : {this.state.className }
        </button></p></div>);
    }

    tick() {
        const styleMap = [
            'App-RockingAway',
            'App-HalfCaffed',
            'App-InNeedOfCaffeine',
            'App-Unknown'
        ];

        // This is how to GET information from the REST api using filters
        const request = require('superagent');
        request
            .get(RestApiRoot + '/count?where=%7B%22caffeinated%22%3A%22false%22%7D')
            .then(response => {
                if (response.body.count <= 2)
                {
                    this.setState({
                        className: styleMap[response.body.count],
                        date: new Date()
                    })
                }
            })
    }
}

class MyButton extends React.Component {
    render() {
        return (
            <div className="MyButton">
                <p>
                    <button className={"MyButton"} onClick={() => this.onClick() }>
                        I'm thirsty!
                    </button>
                </p>
            </div>
        );
    }

    onClick() {
        const now = (new Date()).toUTCString();

        //TODO: Figure out how to get system local username or identifier so that we can use upsert api instead
        // of posting a new instance all the time
        const username = now;

        // This is how we can POST new record using 'Superagent' package. There are other packages
        // that can be used (and prototyped).
        const request = require('superagent');
        request
            .post(RestApiRoot)
            .type('application/json')
            .send({
                "user": username,
                "timeOfRequest": now,
                "caffeinated": false
            })
            .then(function(res) {
                // no-op
            })
    }
}

class QuenchButton extends React.Component {
    render() {
        return (
            <div className="QuenchButton">
                <p>
                    <button className={"QuenchButton"} onClick={() => this.onClick() }>
                        Gone quenching...
                    </button>
                </p>
            </div>
        )
    }

    // This is how we can POST and update to all records matching the filter.
    // TODO: Can we put the where clause in a .query() instead?
    onClick() {
        const request = require('superagent')
        request
            .post(RestApiRoot + '/update?where=%7B%22caffeinated%22%3Afalse%7D')
            .type('application/json')
            .send('{"caffeinated":true}')
            .then(function(res){})
    }
}


ReactDOM.render(<App />,document.getElementById('root'));

export default App;
