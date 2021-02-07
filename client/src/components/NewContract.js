import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Accounts from "./Accounts";
import constants from "../utils/constants";

const NewContract = ({ contract, accounts, web3 }) => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [name, setName] = useState(null);
  const [totalSum, setTotalSum] = useState(null);
  const [seller, setSeller] = useState(null);
  const [account, setAccount] = useState(null);
  const [creatingContract, setCreatingContract] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchWalletDetails = async () => {
      if (account) {
        let b = await web3.eth.getBalance(account);
        b = web3.utils.fromWei(b, "ether");
        setBalance(b);
      }
    };
    fetchWalletDetails();
  });

  const changeName = (e) => {
    setName(e.target.value);
  };

  const changeTotalSum = (e) => {
    let total = e.target.value;
    setTotalSum(total);
  };

  const changeSeller = (e) => {
    setSeller(e.target.value);
  };

  const submitDisabled =
    !name ||
    totalSum < 1 ||
    !web3.utils.isAddress(seller) ||
    !web3.utils.isAddress(account) ||
    creatingContract ||
    seller === account;

  const onSubmit = (e) => {
    e.preventDefault();
    const createContract = async () => {
      if (submitDisabled) return;
      setCreatingContract(true);
      try {
        let total = web3.utils.toWei(totalSum, "ether");
        let res = await contract.methods
          .createContract(name, total, seller)
          .send({ from: account, gas: constants.gasLimit });
        let values =
          res &&
          res.events &&
          res.events.ContractCreated &&
          res.events.ContractCreated.returnValues;
        let cId = values.id;
        setAlertMsg(`Contract successfully created - ID: ${cId}`);
      } catch (e) {
        setErrorMsg(e.message);
      }
      setCreatingContract(false);
    };
    createContract();
  };

  const accountList = <Accounts setAccount={setAccount} accounts={accounts} />;

  return (
    <div className="container new-contract outer-shadow">
      <Link className="btn btn-primary" to="/">
        Back Home
      </Link>
      <h1>New Contract</h1>
      <div className="container">
        {alertMsg ? (
          <div className="alert alert-info" role="alert">
            {alertMsg}
          </div>
        ) : null}
        <div className="account-list">
          <h3>Accounts:</h3>
          {accountList}
        </div>
        <p />
        <div className="balance">
          Balance: {balance} <span>Ether</span>
        </div>

        <div className="row">
          <div className="w-100">
            <div className="input-group outer-shadow hover-in-shadow">
              <input
                type="text"
                id="name"
                placeholder="Contract name"
                value={name}
                onChange={changeName}
                className="input-control"
              />
            </div>
            <div class="input-group outer-shadow hover-in-shadow">
              <input
                type="number"
                id="total"
                placeholder="Apartment cost (In Ether)"
                value={totalSum}
                onChange={changeTotalSum}
                class="input-control"
              />
            </div>
            <div class="input-group outer-shadow hover-in-shadow">
              <input
                type="text"
                id="seller"
                placeholder="Wallet address (Seller Address)"
                value={seller}
                onChange={changeSeller}
                class="input-control"
              />
            </div>
            <div class="input-group outer-shadow">
              <input
                type="text"
                className="form-control"
                id="seller"
                placeholder="Wallet address (Buyer)"
                value={account}
                readOnly
                class="input-control"
              />
            </div>
          </div>
        </div>
        {errorMsg ? (
          <div className="alert alert-danger" role="alert">
            {errorMsg}
          </div>
        ) : null}
        <div
          onClick={onSubmit}
          disabled={submitDisabled}
          className="send-btn outer-shadow hover-in-shadow"
        >
          <button type="submit" className="inner-btn">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewContract;
