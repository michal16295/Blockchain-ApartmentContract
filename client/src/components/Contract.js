import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import constants from '../utils/constants';
import Accounts from './Accounts';

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
        name: '-',
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
                b = web3.utils.fromWei(b, 'ether');
                setBalance(b);
            }
        }
        fetchWalletDetails();
    });

    const statusNames = ["Cancelled", "Finished", "Active"];
    const status = details.status < 0 ? "Unknown" : statusNames[details.status];

    const changeContractId = e => {
        setContractId(Number(e.target.value));
    }

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
                    totalSum: web3.utils.fromWei(apartment.totalSum, 'ether'),
                    paidSum: web3.utils.fromWei(apartment.paidSum, 'ether'),
                    diff: web3.utils.fromWei(diff, 'ether'),
                    status: apartment.status,
                    isActive,
                    seller: apartment.seller,
                    buyer: apartment.buyer,
                };
                setDetails(d);
                setContractLoading(false);
            }
            fetchContractDetails();
        }
    }

    const loadContractBtnDisabled = contractLoading || contractId <= 0;

    const accountList = <Accounts setAccount={setAccount} accounts={accounts} />;

    const contractDetails = (
        <div>
            <div className="row g-3">
                <div className="col-auto">
                    <label htmlFor="contractId" className="form-label" style={{ transform: 'translateY(25%)' }}>Contract ID</label>
                </div>
                <div className="col-auto">
                    <input type="number" className="form-control" id="contractId" placeholder="0" value={contractId} onChange={changeContractId} />
                </div>
                <div className="col-auto">
                    <button type="submit" className="btn btn-primary mb-3" onClick={onLoadContractClick} disabled={loadContractBtnDisabled}>Load contract</button>
                </div>
            </div>
            {details.id < 1
                ?
                details.id == null ?
                    <div className="alert alert-info" role="alert">Enter contract ID and load first</div>
                    : <div className="alert alert-danger" role="alert">Contract not found</div>
                :
                <div>
                    <div>ID: {details.id}</div>
                    <div>Name: {details.name}</div>
                    <div>Total: {details.totalSum}</div>
                    <div>Paid: {details.paidSum}</div>
                    <div>Difference: {details.diff}</div>
                    <div>Active: {details.isActive ? 'Yes' : 'No'}</div>
                    <div>Status: {status}</div>
                    <div>Seller: {details.seller}</div>
                    <div>Buyer: {details.buyer}</div>
                </div>
            }
        </div>
    );

    const selectedWallet = (
        <div>
            <div>Address: {account}</div>
            <div>Balance: {balance} <span>Ether</span></div>
        </div>
    );

    const changeAmount = e => {
        setAmount(e.target.value);
    }

    const paymentDisabled = paymentActive || !account || amount <= 0 || details.id <= 0;

    const onPaymentClick = () => {
        if (!paymentDisabled) {
            const updatePayment = async () => {
                setPaymentActive(true);
                try {
                    let amountEth = web3.utils.toWei(amount, 'ether');
                    await contract.methods.addPayment(details.id).send({
                        from: account, value: amountEth, gas: constants.gasLimit,
                    });
                } catch (e) {
                    setErrorMsg(e.message);
                }
                setPaymentActive(false);
            }
            updatePayment();
        }
    }

    const cancelBtnEnbled = details && details.id > 0 && details.buyer === account && !paymentActive;

    const onCancelClick = e => {
        if (cancelBtnEnbled) {
            const updatePayment = async () => {
                setPaymentActive(true);
                try {
                    await contract.methods.setCancelled(details.id).send({
                        from: account, gas: constants.gasLimit,
                    });
                    window.location.reload();
                } catch (e) {
                    setErrorMsg(e.message);
                }
                setPaymentActive(false);
            }
            updatePayment();
        }
    }

    const buttons = (
        <div>
            <div className="row g-3">
                <div className="col-auto">
                    <label htmlFor="amount" className="form-label" style={{ transform: 'translateY(25%)' }}>Amount</label>
                </div>
                <div className="col-auto">
                    <input type="number" className="form-control" id="amount" placeholder="0" value={amount} onChange={changeAmount} />
                </div>
                <div className="col-auto">
                    <button type="submit" className="btn btn-primary mb-3" onClick={onPaymentClick} disabled={paymentDisabled}>Add payment</button>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-auto">
                    <button type="submit" className="btn btn-danger mb-3" onClick={onCancelClick} disabled={!cancelBtnEnbled}>Cancel Contract</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container-fluid">
            <h1>Contract</h1>
            <div className="row align-items-start">
                <div className="col">
                    <div>Accounts:</div>
                    {accountList}
                </div>
                <div className="col">
                    <div>Selected wallet info:</div>
                    {selectedWallet}
                </div>
            </div>
            <div className="row align-items-start">
                <div className="col">
                    <div>Contract details:</div>
                    <Link className="btn btn-success btn-sm" to="/new">New Contract</Link>
                    <p />
                    {contractDetails}
                </div>
                <div className="col">
                    <div>Actions:</div>
                    {buttons}
                    {errorMsg ?
                        <div className="alert alert-danger" role="alert">{errorMsg}</div>
                        : null}
                </div>
            </div>
        </div>
    );
}

export default Contract;