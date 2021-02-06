import React, { Component } from "react";
import ApartmentContract from "./contracts/ApartmentContract.json";
import getWeb3 from "./getWeb3";
import Contract from './components/Contract';

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

  runExample = async () => {
    const { accounts, contract } = this.state;
    console.log({ accounts, contract });

    await contract.methods.createContract(2, "0x61D4Edc59Bbf5DD72C6Ed45db0CA349Fef159850").send({ from: accounts[0] });
    await contract.methods.addPayment().send({ from: accounts[0], value: 10000, gas: 100000, to: '0x61D4Edc59Bbf5DD72C6Ed45db0CA349Fef159850' });
    /*
    send({
      from?: string | number;
      to?: string;
      value?: number | string | BN;
      gas?: number | string;
      gasPrice?: number | string | BN;
      data?: string;
      nonce?: number;
      chainId?: number;
      common?: Common;
      chain?: string;
      hardfork?: string;
    })
    */
    // Stores a given value, 5 by default.
    // await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getDifference().call();
    console.log(response);

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <Contract contract={this.state.contract} accounts={this.state.accounts} web3={this.state.web3} />
      </div>
    );
  }
}

export default App;
