import React, { useState } from "react";

//Accounts component
const Accounts = ({ setAccount: setParentAccount, accounts }) => {
  const [account, setAccount] = useState(null);

  //Selecting the account
  const onWalletClick = (a) => {
    setAccount(a);
    setParentAccount(a);
  };
  //Displaying the accounts
  let accountList =
    accounts &&
    accounts.map((a) => {
      let btnStyle =
        account === a ? "btn-primary inner-shadow" : "btn-outline-primary";
      let classname = `btn ${btnStyle} btn-sm`;
      return (
        <button
          key={a}
          className={classname + "outer-shadow hover-in-shadow"}
          onClick={() => onWalletClick(a)}
        >
          {a}
        </button>
      );
    });
  return accountList;
};

export default Accounts;
