import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Accounts from './Accounts';
import constants from '../utils/constants';


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
                b = web3.utils.fromWei(b, 'ether');
                setBalance(b);
            }
        }
        fetchWalletDetails();
    });

    const changeName = e => {
        setName(e.target.value);
    }

    const changeTotalSum = e => {
        let total = e.target.value;
        setTotalSum(total);
    }

    const changeSeller = e => {
        setSeller(e.target.value);
    }

    const submitDisabled = !name || totalSum < 1 ||
        !web3.utils.isAddress(seller) || !web3.utils.isAddress(account)
        || creatingContract
        || seller === account;

    const onSubmit = e => {
        e.preventDefault();
        const createContract = async () => {
            if (submitDisabled) return;
            setCreatingContract(true);
            try {
                let total = web3.utils.toWei(totalSum, 'ether');
                let res = await contract.methods.createContract(name, total, seller).send({ from: account, gas: constants.gasLimit });
                let values = res && res.events && res.events.ContractCreated && res.events.ContractCreated.returnValues;
                let cId = values.id;
                setAlertMsg(`Contract successfully created - ID: ${cId}`);
            } catch (e) {
                setErrorMsg(e.message);
            }
            setCreatingContract(false);
        }
        createContract();
    }

    const accountList = <Accounts setAccount={setAccount} accounts={accounts} />;

    return (
        <div>
            <Link className="btn btn-primary btn-sm" to="/">Home</Link>
            <h1>New Contract</h1>
            <div className="container">
                {alertMsg ?
                    <div className="alert alert-info" role="alert">{alertMsg}</div>
                    : null}
                <div className="col">
                    <div>Accounts:</div>
                    {accountList}
                </div>
                <p />
                <div>
                    Balance: {balance} <span>Ether</span>
                </div>
                <p />
                <div className="row g-2">
                    <div className="col-auto">
                        <label htmlFor="name" className="form-label" style={{ transform: 'translateY(25%)' }}>Name:</label>
                    </div>
                    <div className="col-auto" style={{ width: '100%' }}>
                        <input type="text" className="form-control" id="name" placeholder="Contract name" value={name} onChange={changeName} />
                    </div>
                </div>
                <div className="row g-2">
                    <div className="col-auto">
                        <label htmlFor="total" className="form-label" style={{ transform: 'translateY(25%)' }}>Total: (In Ether)</label>
                    </div>
                    <div className="col-auto" style={{ width: '100%' }}>
                        <input type="number" className="form-control" id="total" placeholder="Apartment cost" value={totalSum} onChange={changeTotalSum} />
                    </div>
                </div>
                <div className="row g-2">
                    <div className="col-auto">
                        <label htmlFor="seller" className="form-label" style={{ transform: 'translateY(25%)' }}>Seller address:</label>
                    </div>
                    <div className="col-auto" style={{ width: '100%' }}>
                        <input type="text" className="form-control" id="seller" placeholder="Wallet address" value={seller} onChange={changeSeller} />
                    </div>
                </div>
                <div className="row g-2">
                    <div className="col-auto">
                        <label htmlFor="buyer" className="form-label" style={{ transform: 'translateY(25%)' }}>Buyer address:</label>
                    </div>
                    <div className="col-auto" style={{ width: '100%' }}>
                        <input type="text" className="form-control" id="seller" placeholder="Wallet address" value={account} readOnly />
                    </div>
                </div>
                {errorMsg ?
                    <div className="alert alert-danger" role="alert">{errorMsg}</div>
                    : null}
                <div className="col-auto">
                    <button type="submit" className="btn btn-primary mb-3" onClick={onSubmit} disabled={submitDisabled}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default NewContract;