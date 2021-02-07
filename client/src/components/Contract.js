import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import constants from "../utils/constants";
import Accounts from "./Accounts";

const Contract = ({ contract, accounts, web3 }) => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [paymentActive, setPaymentActive] = useState(false);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractId, setContractId] = useState(null);
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [account, setAccount] = useState(null);
  const [details, setDetails] = useState({
    id: null,
    name: "-",
    totalSum: 0,
    paidSum: 0,
    diff: 0,
    status: -1,
    isActive: null,
    seller: null,
    buyer: null,
  });

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

  const statusNames = ["Cancelled", "Finished", "Active"];
  const status = details.status < 0 ? "Unknown" : statusNames[details.status];

  const changeContractId = (e) => {
    setContractId(Number(e.target.value));
  };

  const onLoadContractClick = () => {
    if (contractId > 0) {
      const fetchContractDetails = async () => {
        setContractLoading(true);
        const apartment = await contract.methods.apartments(contractId).call();
        const diff = await contract.methods.getDifference(contractId).call();
        const isActive = await contract.methods.isActive(contractId).call();

        const d = {
          id: Number(apartment.id),
          name: apartment.name,
          totalSum: web3.utils.fromWei(apartment.totalSum, "ether"),
          paidSum: web3.utils.fromWei(apartment.paidSum, "ether"),
          diff: web3.utils.fromWei(diff, "ether"),
          status: apartment.status,
          isActive,
          seller: apartment.seller,
          buyer: apartment.buyer,
        };
        setDetails(d);
        setContractLoading(false);
      };
      fetchContractDetails();
    }
  };

  const loadContractBtnDisabled = contractLoading || contractId <= 0;

  const accountList = <Accounts setAccount={setAccount} accounts={accounts} />;

  const contractDetails = (
    <div>
      <div className="row">
        <div className="c-30">
          <label htmlFor="contractId">Contract ID</label>
        </div>
        <div className="c-30">
          <input
            type="number"
            className="form-control"
            id="contractId"
            placeholder="0"
            value={contractId}
            onChange={changeContractId}
          />
        </div>
        <div className="c-30">
          <button
            type="submit"
            className="loadBtn"
            onClick={onLoadContractClick}
            disabled={loadContractBtnDisabled}
          >
            Load contract
          </button>
        </div>
      </div>
      {details.id < 1 ? (
        details.id == null ? (
          <div className="alert alert-info" role="alert">
            Enter contract ID and load first
          </div>
        ) : (
          <div className="alert alert-danger" role="alert">
            Contract not found
          </div>
        )
      ) : (
        <div className="data">
          <div className="data-inner">
            <span>ID:</span> {details.id}
          </div>
          <div className="data-inner">
            <span>Name:</span> {details.name}
          </div>
          <div className="data-inner">
            <span>Total:</span> {details.totalSum}
          </div>
          <div className="data-inner">
            <span>Paid:</span> {details.paidSum}
          </div>
          <div className="data-inner">
            <span>Difference:</span> {details.diff}
          </div>
          <div className="data-inner">
            <span>Active:</span> {details.isActive ? "Yes" : "No"}
          </div>
          <div className="data-inner">
            <span>Status:</span> {status}
          </div>
          <div className="data-inner">
            <span>Seller:</span> {details.seller}
          </div>
          <div className="data-inner">
            <span>Buyer:</span> {details.buyer}
          </div>
        </div>
      )}
    </div>
  );

  const selectedWallet = (
    <>
      <div className="info-subtitle">Address: {account}</div>
      <div className="info-subtitle">
        Balance: {balance} <span>Ether</span>
      </div>
    </>
  );

  const changeAmount = (e) => {
    setAmount(e.target.value);
  };

  const paymentDisabled =
    paymentActive || !account || amount <= 0 || details.id <= 0;

  const onPaymentClick = () => {
    if (!paymentDisabled) {
      const updatePayment = async () => {
        setPaymentActive(true);
        try {
          let amountEth = web3.utils.toWei(amount, "ether");
          await contract.methods.addPayment(details.id).send({
            from: account,
            value: amountEth,
            gas: constants.gasLimit,
          });
        } catch (e) {
          setErrorMsg(e.message);
        }
        setPaymentActive(false);
      };
      updatePayment();
    }
  };

  const cancelBtnEnbled =
    details && details.id > 0 && details.buyer === account && !paymentActive;

  const onCancelClick = (e) => {
    if (cancelBtnEnbled) {
      const updatePayment = async () => {
        setPaymentActive(true);
        try {
          await contract.methods.setCancelled(details.id).send({
            from: account,
            gas: constants.gasLimit,
          });
          window.location.reload();
        } catch (e) {
          setErrorMsg(e.message);
        }
        setPaymentActive(false);
      };
      updatePayment();
    }
  };

  const buttons = (
    <div>
      <div className="row">
        <div className="c-30">
          <label htmlFor="amount" className="form-label">
            Amount
          </label>
        </div>
        <div className="c-30">
          <input
            type="number"
            className="form-control"
            id="amount"
            placeholder="0"
            value={amount}
            onChange={changeAmount}
          />
        </div>
        <div className="c-30">
          <button
            type="submit"
            className="loadBtn"
            onClick={onPaymentClick}
            disabled={paymentDisabled}
          >
            Add payment
          </button>
        </div>
      </div>

      <div className="row">
        <div className="newBtn">
          <button
            onClick={onCancelClick}
            disabled={!cancelBtnEnbled}
            type="submit"
            style={{ marginTop: "20px" }}
            className="inner-btn outer-shadow hover-in-shadow"
          >
            Cancel Contract
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container contract outer-shadow">
      <div className="title">
        <h1>Contract</h1>
      </div>
      <div className="row">
        <div className="c-50">
          <div className="accounts outer-shadow">
            <div className="inner">
              <h3 className="subtitle">Accounts</h3>
              {accountList}
            </div>
          </div>
        </div>
        <div className="c-50">
          <div className="info outer-shadow">
            <div className="inner">
              <h3 className="subtitle">Selected wallet info</h3>
              {selectedWallet}
            </div>
          </div>
          <div className="details outer-shadow">
            <h3>Contract details:</h3>

            {contractDetails}
            <div className="newBtn">
              <Link
                className="inner-btn outer-shadow hover-in-shadow"
                to="/new"
              >
                New Contract
              </Link>
            </div>
          </div>
          <div className="actions outer-shadow">
            <h3>Actions:</h3>
            {buttons}
            {errorMsg ? (
              <div className="alert alert-danger" role="alert">
                {errorMsg}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contract;
