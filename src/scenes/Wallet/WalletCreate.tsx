import React, { useState } from "react";
import { TextUtils } from "../../utils/TextUtils";
import { TransactionUtils } from "../../utils/TransactionUtils";
import WalletManage from "./WalletManage";
import AccountManage from "./AccountManage";
import { SafeAuthKit, Web3AuthAdapter } from "@safe-global/auth-kit";
import "tailwindcss/tailwind.css";

function WalletCreate() {
  const [inputs, setInputs] = useState([
    { key: TextUtils.randomString(), value: "" },
  ]);
  // usestate for threshold
  const [threshold, setThreshold] = useState(1);
  // usestate for safe address
  const [safeAddress, setSafeAddress] = useState(
    localStorage.getItem("safeAddress") || ""
  );
  const [account, setAccount] = useState<SafeAuthKit<Web3AuthAdapter>>();

  const addInput = () => {
    setInputs([...inputs, { key: TextUtils.randomString(), value: "" }]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newInputs = [...inputs];
    newInputs[index].value = e.target.value;
    setInputs(newInputs);
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThreshold(Number.parseInt(e.target.value));
  };

  const handleLoggedIn = (loggedInAccount: SafeAuthKit<Web3AuthAdapter>) => {
    setAccount(loggedInAccount);
  };

  const removeInput = (inputToRemove: any) => {
    setInputs(inputs.filter((input, i) => input.key !== inputToRemove.key));
  };

  const createWallet = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log(inputs);
    const safe = await TransactionUtils.createMultisigWallet(
      inputs.map((input) => input.value),
      threshold
    );

    console.log(safe);
  };

  return (
    <div>
      <div className="EventDetail container card shadow my-5 p-5">
        <h1 className="text-2xl text-center mb-3">Create a Wallet</h1>
        <form>
          {inputs.map((input, index) => (
            <div key={input.key} className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder={`Owner ${index + 1} Address`}
                value={input.value}
                onChange={(e) => handleInputChange(e, index)}
              />
              <button
                type="button"
                className="rounded-full btn btn-outline-danger my-2"
                onClick={() => removeInput(input)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-full btn btn-outline-primary my-2"
            onClick={addInput}
          >
            Add Another Owner
          </button>
          <div>
            <hr />

            <label>Owners needed to approve a transaction</label>
            <input
              type="number"
              className="form-control"
              value={threshold || inputs.length}
              onChange={handleThresholdChange}
            />
          </div>
          <button
            className="rounded-full btn btn-primary bg-green-600 my-2 border-black"
            onClick={createWallet}
          >
            Create Wallet
          </button>
          <div className="my-2">
            <p className="my-2">
              To account for the carbon footprint of your transaction we will
              retire every 500 transactions the equivalent in tons.
            </p>
            <p className="my-2">
              Basic: Lowest ranking certificates will be retired - 2 € Quality:
              Highest ranking certificates will be retired - 5 €
            </p>
            <button
              className="rounded-full btn btn-primary bg-green-600 my-2 border-black"
              // onClick=
            >
              Basic 2 €
            </button>
            <button
              className="rounded-full btn btn-primary bg-green-600 m-2 border-black"
              // onClick=
            >
              Quality 5€
            </button>
          </div>
        </form>
        <hr />
      </div>
    </div>
  );
}

export default WalletCreate;
