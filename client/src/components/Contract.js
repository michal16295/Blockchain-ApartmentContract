import React, { useState, useEffect } from 'react';

const Contract = ({ contract, accounts, web3 }) => {
    const [paymentActive, setPaymentActive] = useState(false);
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);
    const [account, setAccount] = useState(null);
    const [details, setDetails] = useState({
        name: '-',
        totalSum: 0,
        paidSum: 0,
        diff: 0,
        status: -1,
        isActive: null,
    });

    useEffect(() => {
        const fetchWalletDetails = async () => {
            if (account) {
                let b = await web3.eth.getBalance(account);
                setBalance(b);
            }
        }
        fetchWalletDetails();
    });

    useEffect(() => {
        const fetchContractDetails = async () => {
            const name = await contract.methods.name().call();
            const totalSum = await contract.methods.totalSum().call();
            const paidSum = await contract.methods.paidSum().call();
            const diff = await contract.methods.getDifference().call();
            const status = await contract.methods.getStatus().call();
            const isActive = await contract.methods.isActive().call();

            const d = {
                name,
                totalSum,
                paidSum,
                diff,
                status,
                isActive,
            };
            setDetails(d);
        }
        fetchContractDetails();
    });

    const statusNames = ["Cancelled", "Finished", "Active"];
    const status = details.status < 0 ? "Unknown" : statusNames[details.status];

    const onWalletClick = a => {
        setAccount(a);
    }

    const accountList = accounts && accounts.map(a => {
        let btnStyle = account === a ? 'btn-primary' : 'btn-outline-primary';
        let classname = `btn ${btnStyle} btn-sm`;
        return <button key={a} className={classname} style={{ width: '100%' }} onClick={() => onWalletClick(a)}>{a}</button>
    });

    const contractDetails = (
        <div>
            <div>Name: {details.name}</div>
            <div>Total: {details.totalSum}</div>
            <div>Paid: {details.paidSum}</div>
            <div>Difference: {details.diff}</div>
            <div>Active: {details.isActive ? 'Yes' : 'No'}</div>
            <div>Status: {status}</div>
        </div>
    );

    const selectedWallet = (
        <div>
            <div>Address: {account}</div>
            <div>Balance: {balance}</div>
        </div>
    );

    const changeAmount = e => {
        setAmount(e.target.value);
    }
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    const onPaymentClick = () => {
        if (account && amount > 0) {
            const updatePayment = async () => {
                setPaymentActive(true);
                await contract.methods.addPayment().send({
                    from: account, value: amount,
                });
                setPaymentActive(false);
            }
            updatePayment();
        }
    }

    const onCancelClick = e => {
        console.log(e);
    }

    const paymentDisabled = paymentActive || !account || !amount;

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
                    <button type="submit" className="btn btn-danger mb-3" onClick={onCancelClick}>Cancel Contract</button>
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
                    {contractDetails}
                </div>
                <div className="col">
                    <div>Actions:</div>
                    {buttons}
                </div>
            </div>
        </div>
    );
}

export default Contract;