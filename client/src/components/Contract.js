import React, { useState, useEffect } from 'react';

const Contract = ({ contract, accounts, web3 }) => {
    const [paymentActive, setPaymentActive] = useState(false);
    const [contractLoading, setContractLoading] = useState(false);
    const [contractId, setContractId] = useState(null);
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);
    const [account, setAccount] = useState(null);
    const [details, setDetails] = useState({
        id: 0,
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
                setBalance(b);
            }
        }
        fetchWalletDetails();
    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const statusNames = ["Cancelled", "Finished", "Active"];
    const status = details.status < 0 ? "Unknown" : statusNames[details.status];

    const onWalletClick = a => {
        setAccount(a);
    }

    const changeContractId = e => {
        setContractId(Number(e.target.value));
    }

    const onContractClick = () => {
        if (contractId > 0) {
            const fetchContractDetails = async () => {
                setContractLoading(true);
                const apartment = await contract.methods.apartments(contractId).call();
                const diff = await contract.methods.getDifference(contractId).call();
                const isActive = await contract.methods.isActive(contractId).call();

                const d = {
                    id: apartment.id,
                    name: apartment.name,
                    totalSum: apartment.totalSum,
                    paidSum: apartment.paidSum,
                    diff,
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

    const contractBtnDisabled = contractLoading || contractId <= 0;

    const accountList = accounts && accounts.map(a => {
        let btnStyle = account === a ? 'btn-primary' : 'btn-outline-primary';
        let classname = `btn ${btnStyle} btn-sm`;
        return <button key={a} className={classname} style={{ width: '100%' }} onClick={() => onWalletClick(a)}>{a}</button>
    });

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
                    <button type="submit" className="btn btn-primary mb-3" onClick={onContractClick} disabled={contractBtnDisabled}>Load contract</button>
                </div>
            </div>
            <div>Name: {details.name}</div>
            <div>Total: {details.totalSum}</div>
            <div>Paid: {details.paidSum}</div>
            <div>Difference: {details.diff}</div>
            <div>Active: {details.isActive ? 'Yes' : 'No'}</div>
            <div>Status: {status}</div>
            <div>Seller: {details.seller}</div>
            <div>Buyer: {details.buyer}</div>
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

    const cancelBtnEnbled = details && details.id > 0 && details.buyer === account;

    const onCancelClick = e => {
        if (cancelBtnEnbled) {
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