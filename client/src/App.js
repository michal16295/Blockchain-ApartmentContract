import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import ApartmentContract from "./contracts/ApartmentContract.json";
import getWeb3 from "./getWeb3";
import Contract from './components/Contract';
import NewContract from './components/NewContract';

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ApartmentContract.networks[networkId];
      const instance = new web3.eth.Contract(
        ApartmentContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      console.log({ instance, accounts })
      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

<<<<<<< HEAD
  runExample = async () => {
    const { accounts, contract } = this.state;
    console.log(accounts, contract);
    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

=======
>>>>>>> edebf7a60fc1d747e3f4eb18a4c68510edbb5ad8
  render() {
    if (!this.state.web3) {
      return <center>Loading Web3, accounts, and contract...</center>;
    }
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/new">
              <NewContract contract={this.state.contract} accounts={this.state.accounts} web3={this.state.web3} />
            </Route>
            <Route path="/">
              <Contract contract={this.state.contract} accounts={this.state.accounts} web3={this.state.web3} />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
