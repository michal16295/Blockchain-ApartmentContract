import React, { useState } from "react";

const Accounts = ({ setAccount: setParentAccount, accounts }) => {
  const [account, setAccount] = useState(null);

  const onWalletClick = (a) => {
    setAccount(a);
    setParentAccount(a);
  };

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
